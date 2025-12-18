from openai import OpenAI
from app.core.config import OPENAI_API_KEY, MODEL_NAME

client = OpenAI(api_key=OPENAI_API_KEY)

def get_embedding(text: str):
    emb = client.embeddings.create(
        model=MODEL_NAME,
        input=text
    )
    return emb.data[0].embedding
