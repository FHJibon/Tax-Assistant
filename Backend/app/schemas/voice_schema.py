from pydantic import BaseModel
from typing import Literal

class TranscribeResponse(BaseModel):
    text: str
    language: Literal['bn', 'en']