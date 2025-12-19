from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.utils.db import get_db
from app.utils.security import decode_access_token
from app.model.model import UploadedDocument, User
from app.services.session import get_or_create_active_session

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    authorization: Optional[str] | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Missing Authorization header")
        token = authorization.replace("Bearer ", "").strip()
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))

        session = await get_or_create_active_session(db, user_id)

        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not (user.nid and user.tin):
            raise HTTPException(status_code=400, detail="Complete your profile with NID and TIN Number before uploading documents")

        # Enforce per-file maximum size (5 MB)
        content = await file.read()
        max_bytes = 5 * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(status_code=400, detail="File too large. Max size is 5 MB")

        # Enforce per-session maximum document count (10)
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

        return JSONResponse({
            "filename": file.filename,
            "status": "uploaded",
            "session_id": session.id,
            "document_id": doc.id,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
