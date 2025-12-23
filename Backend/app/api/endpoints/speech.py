from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.schemas.voice_schema import TranscribeResponse
from app.services.db import get_db
from app.utils.security import decode_access_token
from app.services.speech import transcribe_audio_bytes, UnsupportedSpokenLanguageError


router = APIRouter(prefix="/speech", tags=["Speech"])


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    audio: UploadFile = File(...),
    authorization: Optional[str] | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.replace("Bearer ", "").strip()
    _ = decode_access_token(token)

    content = await audio.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty audio")
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio too large")

    try:
        text, language = await transcribe_audio_bytes(content, filename=audio.filename)
        return TranscribeResponse(text=text, language=language)
    except UnsupportedSpokenLanguageError as e:
        raise HTTPException(status_code=422, detail=str(e))
