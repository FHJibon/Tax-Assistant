from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.utils.db import get_db
from app.utils.security import decode_access_token
from app.model.model import User
from app.schemas.auth_schema import UserRead, ProfileUpdateRequest

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/profile", response_model=UserRead)
async def get_profile(
    authorization: Optional[str] | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = int(payload.get("sub"))
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Schema moved to app.schemas.auth_schema.ProfileUpdateRequest


@router.put("/profile", response_model=UserRead)
async def update_profile(
    payload: ProfileUpdateRequest,
    authorization: Optional[str] | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    try:
        jwt_payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = int(jwt_payload.get("sub"))

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Only update allowed fields with basic validation
    if payload.name is not None:
        name = str(payload.name).strip()
        if not name:
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        user.name = name

    if payload.nid is not None:
        nid = str(payload.nid).strip()
        if nid and not (nid.isdigit() and (len(nid) == 13 or len(nid) == 17)):
            raise HTTPException(status_code=400, detail="Invalid NID format: must be 13 or 17 digits")
        user.nid = nid

    if payload.tin is not None:
        tin = str(payload.tin).strip()
        if tin and not (tin.isdigit() and len(tin) == 12):
            raise HTTPException(status_code=400, detail="Invalid TIN format: must be 12 digits")
        user.tin = tin

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
