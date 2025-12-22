from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.services.db import get_db
from app.utils.security import decode_access_token
from app.model.model import (
    UploadedDocument,
    User,
    NidInfo,
    TinInfo,
    SalaryInfo,
    BankInfo,
    InsuranceInfo,
    DpsInfo,
    SanchaypatraInfo,
    LoanInfo,
)
from app.services.session import get_or_create_active_session, persist_message
from app.utils.information import persist_structured_info
from app.utils.parsing import extract_text
from app.services.summary import (
    summarize,
    identify_document_type,
    extract_structured_data,
    DocType,
)

router = APIRouter(prefix="/upload", tags=["Upload Documents"])


def _is_profile_complete(user: User) -> bool:
    if user.date_of_birth is None:
        return False
    required_fields = [user.phone, user.address, user.occupation, user.nid, user.tin]
    return all(field is not None and str(field).strip() for field in required_fields)


@router.post("/")
async def upload_document(
    file: UploadFile = File(...),
    authorization: Optional[str] | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    # Authentication
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    try:
        token = authorization.replace("Bearer ", "").strip()
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Authorization token")

    # Get user session and profile
    session = await get_or_create_active_session(db, user_id)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate profile completeness (required for all document types)
    if not _is_profile_complete(user):
        raise HTTPException(
            status_code=400,
            detail="Complete profile before uploading documents",
        )

    # File validation
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5 MB")

    existing = await db.execute(
        select(UploadedDocument).where(UploadedDocument.session_id == session.id)
    )
    docs = existing.scalars().all()
    if len(docs) >= 10:
        raise HTTPException(status_code=400, detail="Upload limit reached")

    # Extract and classify document
    extracted_text = ""
    doc_type: DocType = DocType.UNKNOWN
    try:
        extracted_text = await extract_text(
            filename=file.filename,
            mime_type=file.content_type,
            content=content,
        )
        doc_type = await identify_document_type(extracted_text)
    except Exception:
        extracted_text = ""
        doc_type = DocType.UNKNOWN

    # Persist document to database
    doc = UploadedDocument(
        session_id=session.id,
        filename=file.filename,
        mime_type=file.content_type or "application/octet-stream",
        size=len(content),
        content=content,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Extract structured data and generate summary
    summary = None
    try:
        if doc_type != DocType.UNKNOWN:
            structured = await extract_structured_data(extracted_text, doc_type)
            if structured:
                await persist_structured_info(
                    db,
                    session_id=session.id,
                    user_id=user_id,
                    doc_type=doc_type,
                    data=structured,
                )

        summary = await summarize(filename=file.filename or "document", text=extracted_text)
        if doc_type == DocType.UNKNOWN and not summary:
            summary = "- Title: <short>\n- Overview: 4-5 sentences maximum\n"
        
        if summary:
            await persist_message(
                db,
                session.id,
                "assistant",
                f"Summary: {file.filename}\n{summary}",
            )
    except Exception:
        summary = None
    return JSONResponse({
        "filename": file.filename,
        "status": "uploaded",
        "session_id": session.id,
        "document_id": doc.id,
        "summary": summary,
        "doc_type": doc_type.value,
    })


@router.get("/status")
async def get_upload_status(
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

    async def _has_rows(model_cls) -> bool:
        result = await db.execute(
            select(model_cls.id).where(model_cls.session_id == session.id).limit(1)
        )
        return result.scalar_one_or_none() is not None

    statuses = {
        "nid": await _has_rows(NidInfo),
        "tin": await _has_rows(TinInfo),
        "salary": await _has_rows(SalaryInfo),
        "bank": await _has_rows(BankInfo),
        "insurance": await _has_rows(InsuranceInfo),
        "dps": await _has_rows(DpsInfo),
        "sanchaypatra": await _has_rows(SanchaypatraInfo),
        "loan": await _has_rows(LoanInfo),
    }

    return JSONResponse(statuses)
