from typing import List, Tuple, Optional, Dict
from openai import AsyncOpenAI
from app.core.config import OPENAI_API_KEY, GPT_MODEL
from app.utils.embedding import embed
from .pinecone import search

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

def _detect_language(text: str) -> str:
    for ch in text:
        if 0x0980 <= ord(ch) <= 0x09FF:
            return 'bn'
    return 'en'

async def rag_answer(query: str, top_k: int = 10, score_threshold: float = 0.7, chat_history: Optional[List[Dict]] = None) -> Tuple[str, List[dict]]:
    query_emb = await embed(query)
    raw_results = await search(query_emb, top_k)
    valid_results = [r for r in raw_results if r.score >= score_threshold]
    context_blocks: List[str] = []
    sources: List[dict] = []

    for idx, r in enumerate(valid_results, start=1):
        text = (r.metadata or {}).get("text") or ""
        if text:
            context_blocks.append(f"[{idx}] {text}")
            sources.append({
                "id": r.id,
                "score": r.score,
                "text": text,
            })

    summary_blocks: List[str] = []
    if chat_history:
        for m in chat_history[-20:]:
            content = (m.get("content") or "").strip()
            role = (m.get("role") or "").strip().lower()
            if role == "assistant" and content.startswith("Summary:"):
                summary_blocks.append(content)
                sources.append({
                    "id": f"summary-{m.get('id')}",
                    "score": 1.0,
                    "text": content,
                })

    has_rag_docs = len(context_blocks) > 0
    has_summaries = len(summary_blocks) > 0

    if has_rag_docs or has_summaries:
        combined_context_blocks: List[str] = []
        if has_rag_docs:
            combined_context_blocks.extend(context_blocks)
        if has_summaries:
            for idx, s in enumerate(summary_blocks, start=1):
                combined_context_blocks.append(f"[S{idx}] {s}")

        numbered_context = "\n".join(combined_context_blocks)
        instructions = (
            "Small or focused questions: reply in 1–2 short sentences.\n"
            "Bigger questions or calculation: one summary sentence, add 3-5 bullet points for clarity.\n"
            "Do not introduce yourself."
        )
        is_rag_mode = True
    else:
        numbered_context = "(No relevant legal documents or uploaded document summaries found in database)"
        instructions = (
            "Rely on fully knowledge of Income Tax Act 2023.\n"
            "Small or focused questions: reply in 1–2 short sentences.\n"
            "Bigger questions or calculation: one summary sentence, add 3-5 bullet points for clarity.\n"
            "Do not introduce yourself."
        )
        is_rag_mode = False

    lang = _detect_language(query)
    target_lang_instruction = (
        "Answer only in Bangla."
        if lang == 'bn' else
        "Answer only in English."
    )

    system_prompt = (
        "You are a Senior Bangladeshi tax Advisor, expert in the Income Tax Act 2023 and current NBR rules & Regulations. "
        "Always provide clear, concise, and practical answers in friendly manner."
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
        f"Instructions: {instructions}\n"
        f"Context: {numbered_context}\n"
        f"User question: {query}"
    )

    messages.append({"role": "user", "content": user_prompt})

    res = await client.chat.completions.create(
        model=GPT_MODEL,
        messages=messages,
        temperature=0.5 if is_rag_mode else 0.7,
        max_completion_tokens=800,
    )

    import re
    answer = res.choices[0].message.content
    answer = answer.replace('—', ', ')
    return answer, sources

async def answer(query: str, top_k: int = 5, score_threshold: float = 0.5, chat_history: Optional[List[Dict]] = None) -> Tuple[str, List[dict]]:
    return await rag_answer(query, top_k=top_k, score_threshold=score_threshold, chat_history=chat_history)