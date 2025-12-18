from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from sqlalchemy.ext.asyncio import AsyncSession
from app.model.model import Base
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.chatbot import router as chat_router
from app.utils.db import get_db

app = FastAPI(title="Tax Assistant")

@app.on_event("startup")
async def on_startup():
    from app.utils.db import engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Enable CORS for frontend (localhost:3000 by default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)

@app.get("/")
async def root():
    return {"message": "Running!"}

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    return JSONResponse(status_code=500, content={
        "error": "Internal Server Error",
        "detail": str(exc),
        "path": request.url.path,
        "trace": tb
    })