import asyncio
from typing import List, Tuple
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

async def rag_answer(query: str, top_k: int = 5, score_threshold: float = 0.7) -> Tuple[str, List[dict]]:
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
                    "text": text
                })
        
        numbered_context = "\n\n".join(context_blocks)
        instructions = (
            "Context Usage:\n"
            "- ANSWER PRIMARILY BASED ON THE CONTEXT below.\n"
            "- If the context covers the answer, do not add external info.\n"
            "- Only if the context is partial, supplement with your expert knowledge.\n"
            "- Keep it concise: no more than 3 sentences or 3 bullet points."
        )
    else:
        numbered_context = "(No relevant legal documents found in database)"
        instructions = (
            "Context Usage:\n"
            "- No relevant internal documents were found for this specific query.\n"
            "- Answer entirely based on your general knowledge as a Senior Tax Lawyer.\n"
            "- Do not cite references as there is no context.\n"
            "- State clearly what the general law is in Bangladesh.\n"
            "- Keep it concise: no more than 3 sentences or 3 bullet points."
        )

    lang = _detect_language(query)
    target_lang_instruction = (
        "Respond strictly in Bangla."
        if lang == 'bn' else
        "Respond strictly in English."
    )

    system_prompt = (
        "You are a senior Bangladeshi tax lawyer. Specialize in the Bangladesh Income Tax Act. "
        "Answer clearly, shortly, precisely, and accurately. "
        + target_lang_instruction + " If the provided context or citations are in a different language, "
        "translate them and present the final answer strictly in the target language. Do not mix languages. "
        "Limit your response to a maximum of 3 sentences or 3 bullet points."
    )

    user_prompt = (
        f"Instructions:\n{instructions}\n\n"
        f"Context:\n{numbered_context}\n\n"
        f"User question: {query}"
    )

    res = await client.chat.completions.create(
        model=GPT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3 if is_rag_mode else 0.5,
        max_tokens=400,
    )

    answer = res.choices[0].message.content
    return answer, sources