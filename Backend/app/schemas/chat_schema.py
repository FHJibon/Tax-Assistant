from pydantic import BaseModel
from typing import List, Optional

class Document(BaseModel):
    id: str
    text: str
    metadata: Optional[dict] = None

class QueryRequest(BaseModel):
    query: str
    top_k: int = 10

class QueryResponse(BaseModel):
    answer: str

class ChatRequest(BaseModel):
    message: str
    top_k: int = 10
