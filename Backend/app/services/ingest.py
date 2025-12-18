import os
from app.utils.embedding import get_embedding
from app.utils.chunker import hierarchical_chunk
from app.utils.cleaner import split_paragraphs
from app.services.pinecone import upsert_document

def ingest_file(filepath: str):
    print("[INFO] Ingesting file...")
    import PyPDF2
    if filepath.lower().endswith('.pdf'):
        with open(filepath, 'rb') as f:
            text = "".join((page.extract_text() or "") for page in PyPDF2.PdfReader(f).pages)
        print(f"[INFO] Extracted PDF.\n[INFO] Total: {len(text)} chars")
    else:
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    paragraphs = split_paragraphs(text)
    print(f"[INFO] Total: {len(paragraphs)} paragraphs")
    for i, para in enumerate(paragraphs):
        for j, chunk in enumerate(hierarchical_chunk(para)):
            print(f"[INFO] Paragraph {i+1}/{len(paragraphs)} Chunk {j+1}: {len(chunk)} chars")
            embedding = get_embedding(chunk)
            upsert_document(chunk, embedding)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        if pdf_path.lower().endswith('.pdf') and os.path.exists(pdf_path):
            ingest_file(pdf_path)
        else:
            print("[ERROR] Please provide a valid PDF file path.")
    else:
        print("Usage: python ingest.py <file.pdf>")