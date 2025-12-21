from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.model.model import User
from app.utils.security import check_pw, hash_pw, send_otp
from datetime import datetime, timedelta

_pending_signup: dict[str, tuple[str, str, str, datetime]] = {}
_pending_password_reset: dict[str, tuple[str, datetime]] = {}

def _now():
    return datetime.utcnow()

def _expiry(minutes: int = 5):
    return _now() + timedelta(minutes=minutes)

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, name: str, email: str, password: str):
    try:
        hashed_password = await hash_pw(password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Password hashing error: {str(e)}")

    user = User(name=name, email=email, hashed_password=hashed_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def authenticate_user(db: AsyncSession, email: str, password: str):
    user = await get_user_by_email(db, email)
    if not user:
        return False
    if not await check_pw(password, user.hashed_password):
        return False
    return user

    
async def start_signup(name: str, email: str, password: str) -> None:
    hashed = await hash_pw(password)
    code = await send_otp(email, "signup")
    _pending_signup[email] = (name, hashed, code, _expiry())

async def verify_signup(db: AsyncSession, email: str, code: str):
    item = _pending_signup.get(email)
    if not item:
        return False
    name, hashed_password, stored_code, expires_at = item
    if _now() > expires_at:
        _pending_signup.pop(email, None)
        return False
    if stored_code != code:
        return False
    user = await get_user_by_email(db, email)
    if user:
        _pending_signup.pop(email, None)
        return False
    new_user = User(name=name, email=email, hashed_password=hashed_password)  
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    _pending_signup.pop(email, None)
    return new_user

async def start_password_reset(email: str) -> None:
    code = await send_otp(email, "password reset")
    _pending_password_reset[email] = (code, _expiry())

async def reset_password(db: AsyncSession, email: str, code: str, new_password: str) -> bool:
    item = _pending_password_reset.get(email)
    if not item:
        return False
    stored_code, expires_at = item
    if _now() > expires_at:
        _pending_password_reset.pop(email, None)
        return False
    if stored_code != code:
        return False

    user = await get_user_by_email(db, email)
    if not user:
        _pending_password_reset.pop(email, None)
        return False

    user.hashed_password = await hash_pw(new_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    _pending_password_reset.pop(email, None)
    return True

async def change_pass(db: AsyncSession, user_id: int, current_password: str, new_password: str) -> bool:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not await check_pw(current_password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Current password is incorrect")

    if current_password == new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")

    user.hashed_password = await hash_pw(new_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return True

async def delete_user_and_data(db: AsyncSession, user_id: int) -> bool:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email in _pending_signup:
        _pending_signup.pop(user.email, None)
    if user.email in _pending_password_reset:
        _pending_password_reset.pop(user.email, None)

    await db.delete(user)
    await db.commit()
    return True