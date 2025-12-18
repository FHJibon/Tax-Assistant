from pinecone import Pinecone, ServerlessSpec
from app.core.config import PINECONE_API_KEY, PINECONE_INDEX
import uuid

pc = Pinecone(api_key=PINECONE_API_KEY)

def get_or_create_index():
    indexes = [i["name"] for i in pc.list_indexes()]

    if PINECONE_INDEX not in indexes:
        pc.create_index(
            name=PINECONE_INDEX,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    return pc.Index(PINECONE_INDEX)

index = get_or_create_index()

def upsert_document(text: str, embedding: list, metadata: dict = None):
    doc_id = str(uuid.uuid4())

    index.upsert(
        vectors=[{
            "id": doc_id,
            "values": embedding,
            "metadata": metadata or {"text": text}
        }]
    )

    return doc_id

def search_index(embedding: list, top_k: int = 10):
    res = index.query(
        vector=embedding,
        top_k=top_k,
        include_metadata=True
    )
    return res.matches