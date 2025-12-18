from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.model.model import ChatSession, ChatMessage

async def get_or_create_active_session(db: AsyncSession, user_id: int) -> ChatSession:
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == user_id, ChatSession.active == True)
    )
    session = result.scalars().first()
    if session:
        return session
    # Create new active session
    new_session = ChatSession(user_id=user_id, active=True)
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session

async def terminate_active_session(db: AsyncSession, user_id: int) -> str:
    # Find current active session
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == user_id, ChatSession.active == True)
    )
    current = result.scalars().first()
    if current:
        # Mark inactive; cascades will delete children when session row is deleted if configured
        await db.execute(
            update(ChatSession)
            .where(ChatSession.id == current.id)
            .values(active=False)
        )
        await db.commit()
    # Create a fresh session
    fresh = ChatSession(user_id=user_id, active=True)
    db.add(fresh)
    await db.commit()
    await db.refresh(fresh)
    return fresh.id

async def persist_message(db: AsyncSession, session_id: str, role: str, content: str) -> int:
    msg = ChatMessage(session_id=session_id, role=role, content=content)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg.id

async def fetch_history(db: AsyncSession, user_id: int) -> list[dict]:
    # Get active session
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == user_id, ChatSession.active == True)
    )
    session = result.scalars().first()
    if not session:
        return []
    # Get messages for session in chronological order
    res = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc())
    )
    messages = res.scalars().all()
    return [
        {"id": m.id, "role": m.role, "content": m.content, "created_at": str(m.created_at)}
        for m in messages
    ]
