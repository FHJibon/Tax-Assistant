import asyncio
from typing import List, Tuple, Optional, Dict
from openai import AsyncOpenAI
from app.core.config import OPENAI_API_KEY, GPT_MODEL
from ..utils.embedding import get_embedding
from .pinecone import search_index

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

def _detect_language(text: str) -> str:
    for ch in text:
        if 0x0980 <= ord(ch) <= 0x09FF:
            return 'bn'
    return 'en'

async def rag_answer(query: str, top_k: int = 5, score_threshold: float = 0.7, chat_history: Optional[List[Dict]] = None) -> Tuple[str, List[dict]]:
    query_emb = await asyncio.to_thread(get_embedding, query)
    raw_results = await asyncio.to_thread(search_index, query_emb, top_k)
    valid_results = [r for r in raw_results if r.score >= score_threshold]
    context_blocks = []
    sources = []
    is_rag_mode = len(valid_results) > 0

    if is_rag_mode:
        for idx, r in enumerate(valid_results, start=1):
            text = (r.metadata or {}).get("text") or ""
            if text:
                context_blocks.append(f"[{idx}] {text}")
                sources.append({
                    "id": r.id,
                    "score": r.score,
                    "text": text,
                })

        numbered_context = "\n\n".join(context_blocks)
        instructions = (
            "Use the numbered context as your primary source.\n"
            "Small, focused questions: reply in 1–2 short sentences, no bullets.\n"
            "Bigger questions: one summary sentence, then up to 3 helpful bullet points if they really add clarity.\n"
            "Do not introduce yourself or add long disclaimers."
        )
    else:
        numbered_context = "(No relevant legal documents found in database)"
        instructions = (
            "Rely on your knowledge of Bangladesh NBR law.\n"
            "Small, focused questions: reply in 1–2 short sentences, no bullets.\n"
            "Bigger questions: one summary sentence, then up to 3 helpful bullet points if they really add clarity.\n"
            "Do not introduce yourself"
        )

    lang = _detect_language(query)
    target_lang_instruction = (
        "Answer only in Bangla."
        if lang == 'bn' else
        "Answer only in English."
    )

    system_prompt = (
        "You are a Senior Bangladesh tax Advisor AI, expert in the Income Tax Act and current NBR rules. "
        "Always provide clear, concise, and practical answers—friendly."
        + target_lang_instruction + " If any context or user input is in another language, translate it and always answer only in the target language.\n"
    )

    messages = [{"role": "system", "content": system_prompt}]

    if chat_history:
        for m in chat_history[-30:]:
            role = "assistant" if m.get("role") == "assistant" else "user"
            content = m.get("content") or ""
            if content:
                messages.append({"role": role, "content": content})

    user_prompt = (
        f"Instructions:\n{instructions}\n\n"
        f"Context:\n{numbered_context}\n\n"
        f"User question: {query}"
    )

    messages.append({"role": "user", "content": user_prompt})

    res = await client.chat.completions.create(
        model=GPT_MODEL,
        messages=messages,
        temperature=0.2 if is_rag_mode else 0.4,
        max_tokens=400,
    )

    answer = res.choices[0].message.content
    return answer, sources