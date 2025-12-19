from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.utils.db import get_db
from app.utils.security import decode_access_token
from app.model.model import UploadedDocument, User
from app.services.session import get_or_create_active_session, persist_message
from app.utils.parsing import extract_text
from app.services.summary import summarize

router = APIRouter(prefix="/upload", tags=["Upload Documents"])

@router.post("/")
async def upload_document(
    file: UploadFile = File(...),
    authorization: Optional[str] | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        token = authorization.replace("Bearer ", "").strip()
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Authorization token")

    session = await get_or_create_active_session(db, user_id)

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not (user.nid and user.tin):
        raise HTTPException(
            status_code=400,
            detail="Complete your profile with NID and TIN Number before uploading documents",
        )

    content = await file.read()
    max_bytes = 5 * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail="File too large. Max size is 5 MB")

    existing = await db.execute(select(UploadedDocument).where(UploadedDocument.session_id == session.id))
    docs = existing.scalars().all()
    if len(docs) >= 10:
        raise HTTPException(status_code=400, detail="Upload limit reached. Maximum 10 files per session")

    doc = UploadedDocument(
        session_id=session.id,
        filename=file.filename,
        mime_type=file.content_type or "application/octet-stream",
        size=len(content),
        content=content,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    summary: str | None = None
    try:
        extracted_text = await extract_text(
            filename=file.filename,
            mime_type=file.content_type,
            content=content,
        )
        summary = await summarize(filename=file.filename or "document", text=extracted_text)
        if summary:
            await persist_message(
                db,
                session.id,
                "assistant",
                f"Document summary — {file.filename or 'document'}\n\n{summary}",
            )
    except Exception:
        summary = None

    return JSONResponse({
        "filename": file.filename,
        "status": "uploaded",
        "session_id": session.id,
        "document_id": doc.id,
        "summary": summary,
    })
