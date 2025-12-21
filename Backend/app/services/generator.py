from __future__ import annotations
from pathlib import Path
from typing import Any, Dict, List
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.model.model import (
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

def _safe_str(value: Any) -> str:
    return str(value) if value is not None else ""

def _safe_float(value: Any) -> float:
    try:
        return float(value) if value is not None else 0.0
    except (TypeError, ValueError):
        return 0.0

async def _get_single(db: AsyncSession, model, *conditions):
    stmt = select(model).where(*conditions)
    result = await db.execute(stmt)
    return result.scalars().first()

async def prepare_tax_context(db: AsyncSession, user_id: int, session_id: str) -> Dict[str, Any]:

    user = await _get_single(db, User, User.id == user_id)
    nid = await _get_single(db, NidInfo, NidInfo.user_id == user_id, NidInfo.session_id == session_id)
    tin = await _get_single(db, TinInfo, TinInfo.user_id == user_id, TinInfo.session_id == session_id)
    salary = await _get_single(db, SalaryInfo, SalaryInfo.user_id == user_id, SalaryInfo.session_id == session_id)
    bank = await _get_single(db, BankInfo, BankInfo.user_id == user_id, BankInfo.session_id == session_id)
    insurance = await _get_single(db, InsuranceInfo, InsuranceInfo.user_id == user_id, InsuranceInfo.session_id == session_id)
    dps = await _get_single(db, DpsInfo, DpsInfo.user_id == user_id, DpsInfo.session_id == session_id)
    sanchay = await _get_single(db, SanchaypatraInfo, SanchaypatraInfo.user_id == user_id, SanchaypatraInfo.session_id == session_id)
    loan = await _get_single(db, LoanInfo, LoanInfo.user_id == user_id, LoanInfo.session_id == session_id)

    basic = _safe_float(getattr(salary, "basic_pay", 0))
    house_rent = _safe_float(getattr(salary, "house_rent", 0))
    medical = _safe_float(getattr(salary, "medical", 0))
    conveyance = _safe_float(getattr(salary, "conveyance", 0))
    festival = _safe_float(getattr(salary, "festival_bonus", 0))
    total_salary = basic + house_rent + medical + conveyance + festival

    inv_life = _safe_float(getattr(insurance, "life_insurance_premium", 0))
    inv_dps = _safe_float(getattr(dps, "dps_contribution", 0))
    inv_sanchay = _safe_float(getattr(sanchay, "sanchaypatra_investment", 0))
    total_investment = inv_life + inv_dps + inv_sanchay

    bank_interest = _safe_float(getattr(bank, "interest_income", 0))
    total_income = total_salary + bank_interest

    bank_balance = _safe_float(getattr(bank, "bank_balance", 0))
    loan_amount = _safe_float(getattr(loan, "loan_outstanding", 0))

    tin_raw = _safe_str(getattr(tin, "tin_number", getattr(user, "tin", "")))
    tin_chars: List[str] = list(tin_raw.ljust(12, " "))[:12]

    dob_raw = str(getattr(user, "date_of_birth", ""))
    if dob_raw and len(dob_raw) >= 10:
        dob_day = [dob_raw[8], dob_raw[9]]
        dob_month = [dob_raw[5], dob_raw[6]]
        dob_year = [dob_raw[0], dob_raw[1], dob_raw[2], dob_raw[3]]
    else:
        dob_day = ["", ""]
        dob_month = ["", ""]
        dob_year = ["", "", "", ""]

    context: Dict[str, Any] = {
        "name": _safe_str(user.name if user else ""),
        "nid": _safe_str(nid.nid_number if nid else getattr(user, "nid", "")),
        "tin_chars": tin_chars,
        "circle": _safe_str(getattr(tin, "tin_circle", "")),
        "zone": _safe_str(getattr(tin, "tax_zone", "")),
        "dob_day": dob_day,
        "dob_month": dob_month,
        "dob_year": dob_year,
        "spouse_name": "",
        "spouse_tin": "",
        "address": _safe_str(getattr(user, "address", "")),
        "phone": _safe_str(getattr(user, "phone", "")),
        "mobile": _safe_str(getattr(user, "phone", "")),
        "email": _safe_str(getattr(user, "email", "")),
        "employer": _safe_str(getattr(salary, "employer_name", "")),
        "sal_basic": basic,
        "sal_rent": house_rent,
        "sal_medical": medical,
        "sal_conveyance": conveyance,
        "sal_festival": festival,
        "sal_total": total_salary,
        "inv_life": inv_life,
        "inv_dps": inv_dps,
        "inv_sanchay": inv_sanchay,
        "inv_total": total_investment,
        "bank_interest": bank_interest,
        "bank_balance": bank_balance,
        "total_income": total_income,
        "loan_outstanding": loan_amount,
    }

    return context

def _get_jinja_env() -> Environment:
    base_dir = Path(__file__).resolve().parent.parent  
    templates_dir = base_dir / "utils"
    env = Environment(
        loader=FileSystemLoader(str(templates_dir)),
        autoescape=select_autoescape(enabled_extensions=("html", "xml")),
    )
    return env

def _html_to_pdf_bytes(html: str) -> bytes:
    from io import BytesIO
    from xhtml2pdf import pisa

    result = BytesIO()
    pisa_status = pisa.CreatePDF(html, dest=result, encoding="utf-8")
    if pisa_status.err:
        raise RuntimeError("Failed to generate PDF from HTML")
    return result.getvalue()

async def generate_tax_return_pdf(db: AsyncSession, user_id: int, session_id: str) -> bytes:
    context = await prepare_tax_context(db, user_id=user_id, session_id=session_id)
    env = _get_jinja_env()
    template = env.get_template("tax_return.html")
    html = template.render(c=context)
    pdf_bytes = _html_to_pdf_bytes(html)
    return pdf_bytes
