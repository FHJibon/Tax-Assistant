import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(30)
DATABASE_URL = os.getenv("DATABASE_URL")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = "tax-index"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = "text-embedding-3-small"
GPT_MODEL = "gpt-4o-mini"