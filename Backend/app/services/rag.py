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
            "Answer briefly as a Bangladesh tax advisor.\n"
            "• Use the numbered context as your main source; add Act 2023 / NBR details only if needed to fill a gap.\n"
            "• Be precise with numbers; when you calculate tax, show a very short slab / rate breakdown.\n"
            "• Small, focused questions: reply in 1–2 short sentences, no bullets.\n"
            "• Bigger questions: one summary sentence, then up to 3 helpful bullet points if they really add clarity.\n"
            "• Do not introduce yourself or add long disclaimers."
        )
    else:
        numbered_context = "(No relevant legal documents found in database)"
        instructions = (
            "Answer briefly as a Bangladesh tax advisor (no internal documents).\n"
            "• Rely on your knowledge of the Income Tax Act and current NBR rules.\n"
            "• Be precise with numbers; when you calculate tax, show a very short slab / rate breakdown.\n"
            "• Small, focused questions: reply in 1–2 short sentences, no bullets.\n"
            "• Bigger questions: one summary sentence, then up to 3 helpful bullet points if they really add clarity.\n"
            "• Do not introduce yourself or add long disclaimers."
        )

    lang = _detect_language(query)
    target_lang_instruction = (
        "Answer only in Bangla."
        if lang == 'bn' else
        "Answer only in English."
    )

    system_prompt = (
        "You are an AI tax & law assistant, like a senior Bangladesh tax advisor. "
        "You focus on the Bangladesh Income Tax Act 2023 and current NBR rules. "
        "Keep answers friendly, clear and professional, never overly formal. "
        + target_lang_instruction +
        " Use conversation history to stay consistent with what the user already said. "
        "If any context is in another language, translate it but answer only in the target language. "
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
        temperature=0.3 if is_rag_mode else 0.5,
        max_tokens=400,
    )

    answer = res.choices[0].message.content
    return answer, sources