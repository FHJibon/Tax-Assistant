from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.services.db import get_db
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

    if payload.name is not None:
        name = str(payload.name).strip()
        if not name:
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        user.name = name

    if payload.nid is not None:
        nid = str(payload.nid).strip()
        if nid and not (nid.isdigit() and (len(nid) in (10, 13, 17))):
            raise HTTPException(status_code=400, detail="Invalid NID format: must be 10, 13 or 17 digits")
        user.nid = nid

    if payload.tin is not None:
        tin = str(payload.tin).strip()
        if tin and not (tin.isdigit() and len(tin) == 12):
            raise HTTPException(status_code=400, detail="Invalid TIN format: must be 12 digits")
        user.tin = tin

    if payload.date_of_birth is not None:
        dob_str = str(payload.date_of_birth).strip()
        if dob_str:
            try:
                from datetime import date
                year, month, day = map(int, dob_str.split("-"))
                dob = date(year, month, day)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid date_of_birth format. Use YYYY-MM-DD")
            user.date_of_birth = dob
        else:
            user.date_of_birth = None

    if payload.phone is not None:
        phone = str(payload.phone).strip()
        if phone:
            if not (phone.isdigit() and len(phone) == 11):
                raise HTTPException(status_code=400, detail="Invalid phone format: must be exactly 11 digits")
            user.phone = phone
        else:
            user.phone = None

    if payload.address is not None:
        address = str(payload.address).strip()
        user.address = address or None

    if payload.occupation is not None:
        occupation = str(payload.occupation).strip()
        user.occupation = occupation or None

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user