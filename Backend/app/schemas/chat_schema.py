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
    session_id: Optional[str] = None
    terminated: Optional[bool] = False

class ChatRequest(BaseModel):
    message: str
    top_k: int = 10


class ChatMessageRead(BaseModel):
    id: int
    role: str
    content: str
    created_at: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageRead]
