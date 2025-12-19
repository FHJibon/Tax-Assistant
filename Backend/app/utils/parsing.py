from __future__ import annotations
import asyncio
import base64
from io import BytesIO
from openai import AsyncOpenAI
from app.core.config import OPENAI_API_KEY, GPT_MODEL
_client: AsyncOpenAI | None = None

def _get_client() -> AsyncOpenAI | None:
    global _client
    if not OPENAI_API_KEY:
        return None
    if _client is None:
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _client


def _is_pdf(filename: str | None, mime_type: str | None) -> bool:
    name = (filename or "").lower()
    mime = (mime_type or "").lower()
    return name.endswith(".pdf") or mime == "application/pdf"


def _is_text_like(filename: str | None, mime_type: str | None) -> bool:
    name = (filename or "").lower()
    mime = (mime_type or "").lower()
    return (
        mime.startswith("text/")
        or mime in {"application/json", "application/xml"}
        or name.endswith((".txt", ".csv", ".json", ".xml"))
    )


def _is_image(filename: str | None, mime_type: str | None) -> bool:
    name = (filename or "").lower()
    mime = (mime_type or "").lower()
    return mime.startswith("image/") or name.endswith((".png", ".jpg", ".jpeg"))


def _extract_pdf_text(content: bytes) -> str:
    try:
        import PyPDF2

        reader = PyPDF2.PdfReader(BytesIO(content))
        return "\n".join((page.extract_text() or "") for page in reader.pages).strip()
    except Exception:
        return ""


def _extract_text_like(content: bytes) -> str:
    try:
        return content.decode("utf-8", errors="ignore").strip()
    except Exception:
        return ""


async def extract_text(*, filename: str | None, mime_type: str | None, content: bytes) -> str:
    if _is_pdf(filename, mime_type):
        return await asyncio.to_thread(_extract_pdf_text, content)

    if _is_text_like(filename, mime_type):
        return await asyncio.to_thread(_extract_text_like, content)

    if not _is_image(filename, mime_type):
        return ""

    client = _get_client()
    if client is None:
        return ""

    mime = (mime_type or "image/png").lower()
    data_url = f"data:{mime};base64,{base64.b64encode(content).decode('ascii')}"

    system = (
        "You are an OCR engine for tax documents. "
        "Extract all readable text from the image. "
        "Preserve numbers, dates, currency amounts, and names as-is. "
        "Return plain text only. Do not add explanations."
    )

    try:
        res = await client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": system},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract text from this document image."},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
            temperature=0.0,
            max_tokens=1500,
        )
        return (res.choices[0].message.content or "").strip()
    except Exception:
        return ""

