from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.db import get_db
from app.utils.security import decode_access_token
from app.services.session import get_or_create_active_session
from app.services.generator import generate_tax_return_pdf, generate_tax_return_pdf_with_overrides
from app.schemas.gen_schema import GenerateTaxReturnRequest

router = APIRouter(prefix="/generate", tags=["Generator"])

@router.get("/tax-return", response_class=StreamingResponse)
async def generate_tax_return(
    authorization: Optional[str] | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        token = authorization.replace("Bearer ", "").strip()
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Authorization token")

    session = await get_or_create_active_session(db, user_id)

    pdf_bytes = await generate_tax_return_pdf(db, user_id=user_id, session_id=session.id)

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="tax_return.pdf"',
        },
    )


@router.post("/tax-return", response_class=StreamingResponse)
async def generate_tax_return_from_form(
    payload: GenerateTaxReturnRequest,
    authorization: Optional[str] | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        token = authorization.replace("Bearer ", "").strip()
        user_payload = decode_access_token(token)
        user_id = int(user_payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Authorization token")

    session = await get_or_create_active_session(db, user_id)
    overrides = payload.model_dump(exclude_unset=True)

    pdf_bytes = await generate_tax_return_pdf_with_overrides(
        db,
        user_id=user_id,
        session_id=session.id,
        overrides=overrides,
    )

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="tax_return.pdf"',
        },
    )