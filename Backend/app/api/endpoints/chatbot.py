from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.schemas.chat_schema import ChatRequest, QueryResponse, ChatHistoryResponse
from app.services.rag import rag_answer
from app.utils.db import get_db
from app.utils.security import decode_access_token
from app.services.session import (
    get_or_create_active_session,
    terminate_active_session,
    persist_message,
    fetch_history,
)

router = APIRouter(prefix="/chat", tags=["Assistant"])

@router.post("/", response_model=QueryResponse)
async def assistant(
    request: ChatRequest,
    authorization: Optional[str] | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    user_id = int(payload.get("sub"))

    # Check for termination keyword
    if request.message.strip().lower() == "terminate my session":
        new_session_id = await terminate_active_session(db, user_id)
        return QueryResponse(answer="Session terminated. Starting a new session.", session_id=new_session_id, terminated=True)

    session = await get_or_create_active_session(db, user_id)

    # Persist user message
    await persist_message(db, session.id, "user", request.message)

    answer, sources = await rag_answer(request.message, request.top_k)

    # Persist assistant message
    await persist_message(db, session.id, "assistant", answer)

    return QueryResponse(answer=answer, session_id=session.id)


@router.get("/history", response_model=ChatHistoryResponse)
async def history(
    authorization: Optional[str] | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    user_id = int(payload.get("sub"))

    items = await fetch_history(db, user_id)
    return ChatHistoryResponse(messages=items)