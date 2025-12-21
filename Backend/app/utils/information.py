from __future__ import annotations
from sqlalchemy.ext.asyncio import AsyncSession
from app.model.model import User, NidInfo, TinInfo, SalaryInfo, BankInfo, InsuranceInfo, DpsInfo, SanchaypatraInfo, LoanInfo
import datetime
from app.services.summary import DocType, SCHEMAS

async def persist_structured_info(
    db: AsyncSession,
    *,
    session_id: str,
    user_id: int,
    doc_type: DocType,
    data: dict,
) -> object | None:

    model_map = {
        DocType.NID: NidInfo,
        DocType.TIN: TinInfo,
        DocType.SALARY: SalaryInfo,
        DocType.BANK: BankInfo,
        DocType.INSURANCE: InsuranceInfo,
        DocType.DPS: DpsInfo,
        DocType.SANCHAYPATRA: SanchaypatraInfo,
        DocType.LOAN: LoanInfo,
    }
    model_cls = model_map.get(doc_type)
    if not model_cls:
        return None

    data = dict(data)
    data["session_id"] = session_id
    data["user_id"] = user_id

    orm_fields = {c.name for c in model_cls.__table__.columns}
    filtered_data = {k: v for k, v in data.items() if k in orm_fields}

    info = model_cls(**filtered_data)

    user = await db.get(User, user_id)
    if user:
        if doc_type == DocType.NID:
            user.nid = data.get("nid_number")
            user.name = data.get("name") or user.name
            dob = data.get("date_of_birth")
            if dob:
                try:
                    if isinstance(dob, str):
                        user.date_of_birth = datetime.date.fromisoformat(dob)
                    else:
                        user.date_of_birth = dob
                except Exception:
                    pass
        if doc_type == DocType.TIN:
            user.tin = data.get("tin_number")
    db.add(info)
    await db.commit()
    await db.refresh(info)
    return info