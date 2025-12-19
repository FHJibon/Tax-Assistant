from __future__ import annotations

from openai import AsyncOpenAI

from app.core.config import MODEL_NAME, OPENAI_API_KEY

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _client


async def embed(text: str) -> list[float]:
    emb = await _get_client().embeddings.create(model=MODEL_NAME, input=text)
    return emb.data[0].embedding
