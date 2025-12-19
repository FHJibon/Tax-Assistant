from __future__ import annotations
import asyncio
from typing import Optional
from openai import AsyncOpenAI
from app.core.config import OPENAI_API_KEY, GPT_MODEL

_client: Optional[AsyncOpenAI] = None

def _get_client() -> Optional[AsyncOpenAI]:
    global _client
    if not OPENAI_API_KEY:
        return None
    if _client is None:
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _client

def _detect_language(text: str) -> str:
    for ch in text:
        if 0x0980 <= ord(ch) <= 0x09FF:
            return "bn"
    return "en"

def _split_by_tokens(text: str, chunk_tokens: int = 3500) -> list[str]:
    import tiktoken
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)
    chunks: list[str] = []
    start = 0
    n = len(tokens)
    while start < n:
        end = min(start + chunk_tokens, n)
        chunks.append(enc.decode(tokens[start:end]))
        start = end
    return chunks


async def summarize(
    *,
    filename: str,
    text: str,
    max_input_tokens: int = 7000,
) -> Optional[str]:
    client = _get_client()
    if client is None:
        return None

    cleaned = (text or "").strip()
    if not cleaned:
        return None

    import tiktoken

    enc = tiktoken.get_encoding("cl100k_base")
    token_count = len(enc.encode(cleaned))
    lang = _detect_language(cleaned)
    target_lang = "Bangla" if lang == "bn" else "English"

    system = (
        "You summarize user-provided documents for a tax assistant app. "
        "Be factual, do not invent data, and clearly mark unknowns. "
        f"Write only in {target_lang}."
    )

    def _summary_prompt(body: str) -> str:
        return (
            f"File: {filename}\n"
            "You are given partial summaries from chunks of a document.\n"
            "Output format:\n"
            "- Title: <short>\n"
            "- Overview: 2 sentences maximum\n"
            "- Highlights: 5 bullets maximum\n"
            f"""{body}"""
        )

    async def _call_llm(user_content: str, max_tokens: int = 450) -> str:
        res = await client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
            temperature=0.2,
            max_tokens=max_tokens,
        )
        return (res.choices[0].message.content or "").strip()

    if token_count <= max_input_tokens:
        return await _call_llm(_summary_prompt(cleaned), max_tokens=800)
    
    chunks = _split_by_tokens(cleaned, chunk_tokens=3200)

    async def _summarize_chunk(i: int, chunk: str) -> str:
        prompt = (
            f"Chunk {i+1}/{len(chunks)} from document '{filename}'.\n"
            "Extract key facts and amounts; keep it compact.\n\n"
            f"""{chunk}"""
        )
        return await _call_llm(prompt, max_tokens=400)

    partials = await asyncio.gather(*[_summarize_chunk(i, c) for i, c in enumerate(chunks)])
    combined = "\n\n".join([p for p in partials if p])

    final_prompt = (
        f"Document: {filename}\n\n"
        "You are given partial summaries from chunks of a document.\n"
        "Create the final summary in this format (Markdown):\n"
        "- Title: <short>\n"
        "- Overview: 2 sentences maximum\n"
        "- Highlights: 5 bullets maximum\n"
        "Partial summaries:\n"
        f"""{combined}"""
    )

    return await _call_llm(final_prompt, max_tokens=520)