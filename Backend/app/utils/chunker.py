from typing import List

def hierarchical_chunk(text: str, min_tokens: int = 400, max_completion_tokens: int = 1200, overlap: float = 0.15) -> List[str]:
    import tiktoken
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)
    n = len(tokens)
    chunks = []
    start = 0
    chunk_size = max(min_tokens, min(max_completion_tokens, 800))
    overlap_size = int(chunk_size * overlap)
    while start < n:
        end = min(start + chunk_size, n)
        chunk_tokens = tokens[start:end]
        chunk = enc.decode(chunk_tokens)
        chunks.append(chunk)
        if end == n:
            break
        start = end - overlap_size
    return chunks
