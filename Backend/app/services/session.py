from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.model.model import (
    ChatSession,
    ChatMessage,
    UploadedDocument,
    NidInfo,
    TinInfo,
    SalaryInfo,
    BankInfo,
    InsuranceInfo,
    DpsInfo,
    SanchaypatraInfo,
    LoanInfo,
)

async def get_or_create_active_session(db: AsyncSession, user_id: int) -> ChatSession:
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == user_id, ChatSession.active == True)
    )
    session = result.scalars().first()
    if session:
        return session
    new_session = ChatSession(user_id=user_id, active=True)
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session

async def terminate_active_session(db: AsyncSession, user_id: int) -> str:
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == user_id, ChatSession.active == True)
    )
    current = result.scalars().first()
    if current:
        await db.execute(delete(ChatMessage).where(ChatMessage.session_id == current.id))
        await db.execute(delete(UploadedDocument).where(UploadedDocument.session_id == current.id))
        await db.execute(delete(NidInfo).where(NidInfo.session_id == current.id))
        await db.execute(delete(TinInfo).where(TinInfo.session_id == current.id))
        await db.execute(delete(SalaryInfo).where(SalaryInfo.session_id == current.id))
        await db.execute(delete(BankInfo).where(BankInfo.session_id == current.id))
        await db.execute(delete(InsuranceInfo).where(InsuranceInfo.session_id == current.id))
        await db.execute(delete(DpsInfo).where(DpsInfo.session_id == current.id))
        await db.execute(delete(SanchaypatraInfo).where(SanchaypatraInfo.session_id == current.id))
        await db.execute(delete(LoanInfo).where(LoanInfo.session_id == current.id))
        await db.execute(delete(ChatSession).where(ChatSession.id == current.id))
        await db.commit()
    fresh = ChatSession(user_id=user_id, active=True)
    db.add(fresh)
    await db.commit()
    await db.refresh(fresh)
    return fresh.id

async def delete_active_session(db: AsyncSession, user_id: int) -> bool:
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == user_id, ChatSession.active == True)
    )
    current = result.scalars().first()
    if not current:
        return False
    await db.execute(delete(ChatMessage).where(ChatMessage.session_id == current.id))
    await db.execute(delete(UploadedDocument).where(UploadedDocument.session_id == current.id))
    await db.execute(delete(NidInfo).where(NidInfo.session_id == current.id))
    await db.execute(delete(TinInfo).where(TinInfo.session_id == current.id))
    await db.execute(delete(SalaryInfo).where(SalaryInfo.session_id == current.id))
    await db.execute(delete(BankInfo).where(BankInfo.session_id == current.id))
    await db.execute(delete(InsuranceInfo).where(InsuranceInfo.session_id == current.id))
    await db.execute(delete(DpsInfo).where(DpsInfo.session_id == current.id))
    await db.execute(delete(SanchaypatraInfo).where(SanchaypatraInfo.session_id == current.id))
    await db.execute(delete(LoanInfo).where(LoanInfo.session_id == current.id))
    await db.execute(delete(ChatSession).where(ChatSession.id == current.id))
    await db.commit()
    return True

async def persist_message(db: AsyncSession, session_id: str, role: str, content: str, voice_transcript: str | None = None) -> int:
    msg = ChatMessage(session_id=session_id, role=role, content=content, voice_transcript=voice_transcript)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg.id

async def fetch_history(db: AsyncSession, user_id: int) -> list[dict]:
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == user_id, ChatSession.active == True)
    )
    session = result.scalars().first()
    if not session:
        return []
    res = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
    )
    messages = res.scalars().all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "voice_transcript": getattr(m, 'voice_transcript', None),
            "created_at": str(m.created_at),
        }
        for m in messages
    ]