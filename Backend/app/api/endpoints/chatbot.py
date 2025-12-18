from fastapi import APIRouter
from app.schemas.chat_schema import ChatRequest, QueryResponse
from app.services.rag import rag_answer

router = APIRouter(prefix="/chat", tags=["Assistant"])

@router.post("/", response_model=QueryResponse)
async def assistant(request: ChatRequest):
    answer, sources = await rag_answer(request.message, request.top_k)
    return QueryResponse(answer=answer)