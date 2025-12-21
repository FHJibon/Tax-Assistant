from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth_schema import UserCreate, UserRead, Token, VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest, LoginRequest, ChangePasswordRequest, DeleteAccountRequest
from app.services.users import authenticate_user, get_user_by_email, start_signup, verify_signup, start_password_reset, reset_password, change_pass, delete_user_and_data
from app.utils.security import create_access_token, decode_access_token
from app.services.db import get_db
from app.model.model import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    exists = await get_user_by_email(db, user.email)
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    await start_signup(user.name, user.email, user.password)
    return {"message": f"OTP has been sent to {user.email}. Please verify to complete account creation."}

@router.post("/verify")
async def signup_verify(payload: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    user = await verify_signup(db, payload.email, payload.code)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"message": "Your account has been created. Please log in."}

@router.post("/login", response_model=Token)
async def login(user: LoginRequest, db: AsyncSession = Depends(get_db)):
    auth_user = await authenticate_user(db, user.email, user.password)
    if not auth_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(auth_user.id), "email": auth_user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    await start_password_reset(payload.email)
    return {"message": "If an account exists for this email, a reset code has been sent."}

@router.post("/reset-password")
async def password_reset(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    ok = await reset_password(db, payload.email, payload.code, payload.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
    return {"message": "Your password has been reset successfully."}

@router.post("/change-password")
async def change_password(payload: ChangePasswordRequest, authorization: str | None = Header(default=None), db: AsyncSession = Depends(get_db)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    try:
        payload_token = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    sub = payload_token.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    await change_pass(db, int(sub), payload.current_password, payload.new_password)
    return {"message": "Password changed successfully."}

@router.post("/delete-account")
async def delete_account(payload: DeleteAccountRequest, authorization: str | None = Header(default=None), db: AsyncSession = Depends(get_db)):
    if not payload.confirm:
        raise HTTPException(status_code=400, detail="Deletion not confirmed")

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    try:
        payload_token = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    sub = payload_token.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    await delete_user_and_data(db, int(sub))
    return {"message": "Account deleted successfully."}

@router.get("/me", response_model=UserRead)
async def read_me(authorization: str | None = Header(default=None), db: AsyncSession = Depends(get_db)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    email = payload.get("email")
    sub = payload.get("sub")
    user = None
    if email:
        user = await get_user_by_email(db, email)
    if not user and sub:
        user = await db.get(User, int(sub))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
