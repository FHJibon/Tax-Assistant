import io
from openai import AsyncOpenAI
from app.core.config import OPENAI_API_KEY, STT_MODEL
from app.utils.language import detect_language_by_script, has_disallowed_letters

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

class UnsupportedSpokenLanguageError(Exception):
    pass

async def transcribe_audio_bytes(audio_bytes: bytes, filename: str | None = None) -> tuple[str, str]:
 
    name = (filename or 'audio.webm').strip() or 'audio.webm'

    async def _transcribe(language_hint: str | None) -> str:
        buf = io.BytesIO(audio_bytes)
        buf.name = name
        kwargs: dict = {
            "model": STT_MODEL,
            "file": buf,
        }
        if language_hint:
            kwargs["language"] = language_hint
        try:
            res = await client.audio.transcriptions.create(**kwargs)
        except Exception:
            if "language" in kwargs:
                kwargs.pop("language", None)
                res = await client.audio.transcriptions.create(**kwargs)
            else:
                raise
        return (getattr(res, 'text', None) or '').strip()
    
    text = await _transcribe("bn")
    if not text:
        text = await _transcribe("en")
    if not text:
        text = await _transcribe(None)
    if not text:
        return "", "en"
    if has_disallowed_letters(text):
        raise UnsupportedSpokenLanguageError("Only Bangla or English is supported")

    lang = detect_language_by_script(text)
    return text, ("bn" if lang == "bn" else "en")