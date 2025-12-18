from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
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

        # Ensure an active session for this user
        session = await get_or_create_active_session(db, user_id)

        # Enforce profile completeness: require NID and TIN
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not (user.nid and user.tin):
            raise HTTPException(status_code=400, detail="Complete your profile with NID and TIN Number before uploading documents")

        # Validation of NID/TIN formats is handled in Profile settings.
        # Here we only require that NID and TIN exist.

        content = await file.read()

        # Persist document into DB tied to session
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
