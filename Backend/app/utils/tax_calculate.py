from __future__ import annotations

import re
from datetime import date, datetime
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from openai import AsyncOpenAI

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import OPENAI_API_KEY, GPT_MODEL
from app.model.model import (
    BankInfo,
    DpsInfo,
    InsuranceInfo,
    LoanInfo,
    NidInfo,
    SalaryInfo,
    SanchaypatraInfo,
    TinInfo,
    User,
)


_openai_client: Optional[AsyncOpenAI] = None


def _get_openai_client() -> Optional[AsyncOpenAI]:
    global _openai_client
    if not OPENAI_API_KEY:
        return None
    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _openai_client


ALLOWED_TAXPAYER_CATEGORIES = {"general", "women_senior", "disabled"}


def _format_assessment_year(policy_key: str) -> str:
    key = _normalize_tax_fy(policy_key)
    return key.replace("_", "-")


def _annualize_amount(amount: Any, *, is_monthly: bool) -> float:
    v = safe_float(amount)
    return v * 12.0 if is_monthly else v


def _normalize_tax_fy(value: Any) -> str:
    raw = (safe_str(value) or "").lower().strip()
    raw = raw.replace("fy", "").replace("financial year", "").strip()
    raw = raw.replace(" ", "")

    if raw in {"2024/25", "2024-25", "2024_25", "202425"}:
        return "2024_25"
    if raw in {"2025/26", "2025-26", "2025_26", "202526"}:
        return "2025_26"

    return "2024_25"


def _coerce_taxpayer_category(value: Any) -> Optional[str]:
    raw = safe_str(value)
    if not raw:
        return None

    s = raw.strip().lower()
    s = s.replace(" ", "_").replace("-", "_")

    if s in ALLOWED_TAXPAYER_CATEGORIES:
        return s

    if s in {"women", "woman", "female", "senior", "women_and_senior", "women_senior_citizen"}:
        return "women_senior"

    if s in {"disable", "disabled_person", "disability", "pwd"}:
        return "disabled"

    return None


def _normalize_gender(value: Any) -> Optional[str]:
    raw = safe_str(value)
    if not raw:
        return None
    s = raw.strip().lower()

    if s in {"male", "m", "man", "boy"}:
        return "male"
    if s in {"female", "f", "woman", "women", "girl"}:
        return "female"

    if "নারী" in s or "মহিলা" in s:
        return "female"
    if "পুরুষ" in s:
        return "male"

    return None


def _parse_dob_to_date(dob_value: Any) -> Optional[date]:
    if isinstance(dob_value, (datetime, date)):
        return dob_value.date() if isinstance(dob_value, datetime) else dob_value

    raw = safe_str(dob_value)
    if not raw:
        return None

    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(raw[:10], fmt).date()
        except Exception:
            continue

    if len(raw) >= 10 and raw[4] in "-/" and raw[7] in "-/":
        yyyy = raw[0:4]
        mm = raw[5:7]
        dd = raw[8:10]
        if len(yyyy) == 4 and len(mm) == 2 and len(dd) == 2:
            try:
                return date(int(yyyy), int(mm), int(dd))
            except Exception:
                return None

    return None


def _compute_age_years(dob: Optional[date], *, on_date: Optional[date] = None) -> Optional[int]:
    if dob is None:
        return None
    today = on_date or date.today()
    try:
        years = today.year - dob.year
        if (today.month, today.day) < (dob.month, dob.day):
            years -= 1
        return years if years >= 0 else None
    except Exception:
        return None


async def _infer_taxpayer_category_with_llm(*, gender_raw: Optional[str], age_years: Optional[int]) -> Optional[str]:
    client = _get_openai_client()
    if client is None:
        return None

    system = (
        "You classify taxpayer category for a Bangladesh income tax return. "
        "Return exactly one of these labels and nothing else: general, women_senior, disabled. "
        "Rules: Choose women_senior if gender indicates female OR if age_years is 65 or older. "
        "Choose disabled ONLY if disability is explicitly indicated; if unknown, do NOT choose disabled. "
        "If unsure, choose general."
    )

    user = (
        "Classify the category from these fields:\n"
        f"gender_raw={gender_raw!r}\n"
        f"age_years={age_years!r}\n"
        "disability_indicated=False\n"
        "Return only the label."
    )

    try:
        resp = await client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.0,
            max_completion_tokens=200,
        )
    except Exception:
        return None

    content = (resp.choices[0].message.content or "").strip().lower()
    coerced = _coerce_taxpayer_category(content)
    return coerced if coerced in ALLOWED_TAXPAYER_CATEGORIES else None


async def infer_taxpayer_category_from_profile(*, nid_gender: Any, dob_value: Any) -> str:

    dob = _parse_dob_to_date(dob_value)
    age_years = _compute_age_years(dob)
    if age_years is not None and age_years >= 65:
        return "women_senior"

    gender_norm = _normalize_gender(nid_gender)
    if gender_norm == "female":
        return "women_senior"
    if gender_norm == "male":
        return "general"

    gender_raw = safe_str(nid_gender)
    llm = await _infer_taxpayer_category_with_llm(gender_raw=gender_raw, age_years=age_years)
    return llm or "general"


def safe_str(value: Any) -> Optional[str]:
    if value is None:
        return None
    s = str(value).strip()
    return s or None


def safe_float(value: Any) -> float:
    try:
        if value is None:
            return 0.0
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def split_fixed_chars(value: Optional[str], length: int) -> List[str]:
    s = safe_str(value) or ""
    s = s.ljust(length, " ")[:length]
    return list(s)


def normalize_tin(value: Any) -> str:
    raw = safe_str(value) or ""
    return re.sub(r"\D+", "", raw)


def split_dob_parts(dob_value: Any) -> Dict[str, List[str]]:
    day = ["", ""]
    month = ["", ""]
    year = ["", "", "", ""]

    if isinstance(dob_value, (datetime, date)):
        d = dob_value.date() if isinstance(dob_value, datetime) else dob_value
        dd = f"{d.day:02d}"
        mm = f"{d.month:02d}"
        yyyy = f"{d.year:04d}"
        return {"dob_day": [dd[0], dd[1]], "dob_month": [mm[0], mm[1]], "dob_year": list(yyyy)}

    raw = safe_str(dob_value)
    if not raw:
        return {"dob_day": day, "dob_month": month, "dob_year": year}

    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            d = datetime.strptime(raw[:10], fmt).date()
            dd = f"{d.day:02d}"
            mm = f"{d.month:02d}"
            yyyy = f"{d.year:04d}"
            return {"dob_day": [dd[0], dd[1]], "dob_month": [mm[0], mm[1]], "dob_year": list(yyyy)}
        except Exception:
            continue

    if len(raw) >= 10 and raw[4] in "-/" and raw[7] in "-/":
        yyyy = raw[0:4]
        mm = raw[5:7]
        dd = raw[8:10]
        if len(yyyy) == 4 and len(mm) == 2 and len(dd) == 2:
            return {"dob_day": [dd[0], dd[1]], "dob_month": [mm[0], mm[1]], "dob_year": [yyyy[0], yyyy[1], yyyy[2], yyyy[3]]}

    return {"dob_day": day, "dob_month": month, "dob_year": year}


@dataclass
class TaxInputs:
    taxpayer_category: str = "general" 
    income_employment: float = 0.0
    income_bank_interest: float = 0.0
    investment_life: float = 0.0
    investment_dps: float = 0.0
    investment_sanchaypatra: float = 0.0


TAX_POLICIES: Dict[str, Dict[str, Any]] = {

    "2024_25": {
        "exemption": {
            "general": 350000.0,
            "women_senior": 400000.0,
            "disabled": 475000.0,
        },

        "slabs": [
            (100000.0, 0.05),
            (400000.0, 0.10),
            (500000.0, 0.15),
            (500000.0, 0.20),
            (2000000.0, 0.25),
            (None, 0.30),
        ],
    },

    "2025_26": {
        "exemption": {
            "general": 375000.0,
            "women_senior": 425000.0,
            "disabled": 500000.0,
        },
        "slabs": [
            (300000.0, 0.10),
            (400000.0, 0.15),
            (500000.0, 0.20),
            (2000000.0, 0.25),
            (None, 0.30),
        ],
    },
}

_SPECIAL_EXEMPTION_WAR_WOUNDED_FF: Dict[str, float] = {
    "2024_25": 500000.0,
    "2025_26": 525000.0,
}

_SPECIAL_EXEMPTION_THIRD_GENDER: Dict[str, float] = {
    "2024_25": 475000.0,
    "2025_26": 500000.0,
}

_PARENT_OF_DISABLED_EXTRA: Dict[str, float] = {
    "2024_25": 50000.0,
    "2025_26": 50000.0,
}


def _get_exemption(
    *,
    policy_key: str,
    category: str,
    war_wounded_ff: bool = False,
    third_gender: bool = False,
    parent_of_disabled: bool = False,
) -> float:

    key = policy_key if policy_key in TAX_POLICIES else "2024_25"
    policy = TAX_POLICIES.get(key) or TAX_POLICIES["2024_25"]
    exemption_map = policy.get("exemption") or {}

    base = safe_float(exemption_map.get(category) or exemption_map.get("general") or 0.0)
    effective = base

    if war_wounded_ff:
        special = _SPECIAL_EXEMPTION_WAR_WOUNDED_FF.get(key)
        if special is not None:
            effective = max(effective, safe_float(special))

    if third_gender:
        special = _SPECIAL_EXEMPTION_THIRD_GENDER.get(key)
        if special is not None:
            effective = max(effective, safe_float(special))

    if parent_of_disabled:
        extra = _PARENT_OF_DISABLED_EXTRA.get(key, 0.0)
        effective += safe_float(extra)

    return effective


def compute_employment_exemption(employment_income: float) -> float:

    inc = safe_float(employment_income)
    if inc <= 0:
        return 0.0
    return min(inc / 3.0, 500000.0)


def _allocate_exemption_by_components(*, total_exempt: float, components: Dict[str, float]) -> Dict[str, Dict[str, int]]:
    amounts: Dict[str, int] = {k: max(0, int(round(safe_float(v)))) for k, v in (components or {}).items()}
    total_amount = sum(amounts.values())
    exempt_total = max(0, int(round(safe_float(total_exempt))))

    if total_amount <= 0 or exempt_total <= 0:
        exempt = {k: 0 for k in amounts.keys()}
        taxable = {k: amounts[k] for k in amounts.keys()}
        return {"exempt": exempt, "taxable": taxable}

    alloc: Dict[str, int] = {}
    fractions: List[tuple[str, float]] = []

    running = 0
    for k, amt in amounts.items():
        raw = (exempt_total * amt) / total_amount
        take = int(raw) 
        alloc[k] = take
        running += take
        fractions.append((k, raw - take))

    remainder = exempt_total - running
    if remainder > 0:
        fractions.sort(key=lambda x: x[1], reverse=True)
        for i in range(remainder):
            alloc[fractions[i % len(fractions)][0]] += 1

    exempt: Dict[str, int] = {k: min(amounts[k], max(0, alloc.get(k, 0))) for k in amounts.keys()}
    taxable: Dict[str, int] = {k: max(0, amounts[k] - exempt[k]) for k in amounts.keys()}
    return {"exempt": exempt, "taxable": taxable}


def compute_total_income(inp: TaxInputs) -> float:
    employment = safe_float(inp.income_employment)
    employment_taxable = max(0.0, employment - compute_employment_exemption(employment))
    return employment_taxable + safe_float(inp.income_bank_interest)


def compute_total_investment(inp: TaxInputs) -> float:
    return (
        safe_float(inp.investment_life)
        + safe_float(inp.investment_dps)
        + safe_float(inp.investment_sanchaypatra)
    )


def compute_taxable_income(
    *,
    total_income: float,
    policy_key: str,
    category: str,
    war_wounded_ff: bool = False,
    third_gender: bool = False,
    parent_of_disabled: bool = False,
) -> float:
    exemption = _get_exemption(
        policy_key=policy_key,
        category=category,
        war_wounded_ff=war_wounded_ff,
        third_gender=third_gender,
        parent_of_disabled=parent_of_disabled,
    )
    remaining = safe_float(total_income) - exemption
    return remaining if remaining > 0 else 0.0


def compute_gross_tax(*, taxable_income: float, policy_key: str, flat_rate: Optional[float] = None) -> float:
    if flat_rate is not None:
        return safe_float(taxable_income) * safe_float(flat_rate)

    policy = TAX_POLICIES.get(policy_key) or TAX_POLICIES["2024_25"]
    slabs = policy.get("slabs") or []

    remaining = safe_float(taxable_income)
    tax = 0.0

    for amount, rate in slabs:
        if remaining <= 0:
            break
        if amount is None:
            tax += remaining * safe_float(rate)
            remaining = 0.0
            break
        take = max(0.0, min(remaining, safe_float(amount)))
        tax += take * safe_float(rate)
        remaining -= take

    return tax


def compute_tax_rebate(*, total_income: float, eligible_investment: float) -> Dict[str, float]:

    income_limit = safe_float(total_income) * 0.03
    investment_limit = safe_float(eligible_investment) * 0.15
    absolute_limit = 1000000.0
    rebate = min(income_limit, investment_limit, absolute_limit)
    return {
        "rebate": max(0.0, rebate),
        "rebate_limit_by_income": max(0.0, income_limit),
        "rebate_limit_by_investment": max(0.0, investment_limit),
        "rebate_limit_absolute": absolute_limit,
    }


def compute_net_wealth_surcharge(
    *,
    tax_payable: float,
    net_wealth: Optional[float] = None,
    more_than_one_motor_car: bool = False,
    house_area_sqft: Optional[float] = None,
) -> Dict[str, float]:

    wealth = safe_float(net_wealth)
    area = safe_float(house_area_sqft)

    rate = 0.0
    if wealth > 500000000.0:
        rate = 0.35
    elif wealth > 200000000.0:
        rate = 0.30
    elif wealth > 100000000.0:
        rate = 0.20
    elif wealth > 40000000.0:
        rate = 0.10
    else:
        if more_than_one_motor_car or area > 8000.0:
            rate = 0.10

    surcharge = max(0.0, safe_float(tax_payable) * rate)
    return {"net_wealth_surcharge": surcharge, "net_wealth_surcharge_rate": rate}


def compute_minimum_tax(*, total_income: float, policy_key: str, category: str, is_new_taxpayer: bool = False) -> float:
    exemption = _get_exemption(policy_key=policy_key, category=category)
    if safe_float(total_income) <= exemption:
        return 0.0
    return 1000.0 if is_new_taxpayer else 5000.0


def _coerce_residential_status(value: Any) -> str:
    raw = (safe_str(value) or "resident").strip().lower()
    if raw in {"resident", "res"}:
        return "resident"
    if raw in {"nonresident", "non-resident", "non_resident", "nri"}:
        return "non_resident"
    return "resident"


def _coerce_taxpayer_status(value: Any) -> str:
    raw = (safe_str(value) or "individual").strip().lower()
    raw = raw.replace(" ", "_").replace("-", "_")
    if raw in {"individual", "person"}:
        return "individual"
    if raw in {"firm"}:
        return "firm"
    if raw in {"huf", "hindu_undivided_family", "hinduundividedfamily"}:
        return "huf"
    return "others"


async def _get_single(db: AsyncSession, model, *conditions):
    stmt = select(model).where(*conditions)
    result = await db.execute(stmt)
    return result.scalars().first()


def _merge_overrides(base: Dict[str, Any], overrides: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not overrides:
        return base
    merged = dict(base)
    for k, v in overrides.items():
        merged[k] = v
    return merged


async def build_tax_return_context(
    *,
    db: AsyncSession,
    user_id: int,
    session_id: str,
    overrides: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:

    user = await _get_single(db, User, User.id == user_id)
    nid = await _get_single(db, NidInfo, NidInfo.user_id == user_id, NidInfo.session_id == session_id)
    tin = await _get_single(db, TinInfo, TinInfo.user_id == user_id, TinInfo.session_id == session_id)
    salary = await _get_single(db, SalaryInfo, SalaryInfo.user_id == user_id, SalaryInfo.session_id == session_id)
    bank = await _get_single(db, BankInfo, BankInfo.user_id == user_id, BankInfo.session_id == session_id)
    insurance = await _get_single(db, InsuranceInfo, InsuranceInfo.user_id == user_id, InsuranceInfo.session_id == session_id)
    dps = await _get_single(db, DpsInfo, DpsInfo.user_id == user_id, DpsInfo.session_id == session_id)
    sanchay = await _get_single(db, SanchaypatraInfo, SanchaypatraInfo.user_id == user_id, SanchaypatraInfo.session_id == session_id)
    loan = await _get_single(db, LoanInfo, LoanInfo.user_id == user_id, LoanInfo.session_id == session_id)

    base: Dict[str, Any] = {
        "name": safe_str(getattr(nid, "name", None)) or safe_str(getattr(user, "name", None)),
        "nid": safe_str(getattr(nid, "nid_number", None)) or safe_str(getattr(user, "nid", None)),
        "tin": safe_str(getattr(tin, "tin_number", None)) or safe_str(getattr(user, "tin", None)),
        "circle": safe_str(getattr(tin, "tax_circle", None)),
        "zone": safe_str(getattr(tin, "tax_zone", None)),
        "date_of_birth": getattr(user, "date_of_birth", None) or safe_str(getattr(nid, "date_of_birth", None)),
        "address": safe_str(getattr(user, "address", None)),
        "phone": safe_str(getattr(user, "phone", None)),
        "email": safe_str(getattr(user, "email", None)),
        "employer": safe_str(getattr(salary, "employer_name", None)),

        "sal_basic": safe_float(getattr(salary, "basic_pay", None)),
        "sal_rent": safe_float(getattr(salary, "house_rent", None)),
        "sal_medical": safe_float(getattr(salary, "medical", None)),
        "sal_conveyance": safe_float(getattr(salary, "conveyance", None)),
        "sal_festival": safe_float(getattr(salary, "festival_bonus", None)),

        "salary_is_monthly": True,
        "festival_bonus_is_monthly": False,
        "assessment_year": None,

        "bank_interest": safe_float(getattr(bank, "interest_income", None)),
        "bank_balance": safe_float(getattr(bank, "bank_balance", None)),
        "loan_outstanding": safe_float(getattr(loan, "loan_outstanding", None)),

        "inv_life": safe_float(getattr(insurance, "life_insurance_premium", None)),
        "inv_dps": safe_float(getattr(dps, "dps_contribution", None)),
        "inv_sanchay": safe_float(getattr(sanchay, "sanchaypatra_investment", None)),

        "taxpayer_category": await infer_taxpayer_category_from_profile(
            nid_gender=getattr(nid, "gender", None),
            dob_value=(getattr(user, "date_of_birth", None) or safe_str(getattr(nid, "date_of_birth", None))),
        ),

        "residential_status": "resident",
        "taxpayer_status": "individual",
        "benefit_war_wounded_ff": False,
        "benefit_third_gender": False,
        "benefit_parent_of_disabled": False,

        "tax_fy": "2024_25",
        "is_new_taxpayer": False,
        "nri_non_citizen": False,
        "net_wealth": 0.0,
        "more_than_one_motor_car": False,
        "house_area_sqft": 0.0,
        "environmental_surcharge": 0.0,
    }

    merged = _merge_overrides(base, overrides)

    dob_date = _parse_dob_to_date(merged.get("date_of_birth"))
    age_years = _compute_age_years(dob_date)
    gender_norm = _normalize_gender(getattr(nid, "gender", None))

    residential_status = _coerce_residential_status(merged.get("residential_status"))
    taxpayer_status = _coerce_taxpayer_status(merged.get("taxpayer_status"))

    tin_chars = split_fixed_chars(normalize_tin(merged.get("tin")), 12)
    dob_parts = split_dob_parts(merged.get("date_of_birth"))

    salary_is_monthly = bool(merged.get("salary_is_monthly"))
    festival_bonus_is_monthly = bool(merged.get("festival_bonus_is_monthly"))

    sal_basic_annual = _annualize_amount(merged.get("sal_basic"), is_monthly=salary_is_monthly)
    sal_rent_annual = _annualize_amount(merged.get("sal_rent"), is_monthly=salary_is_monthly)
    sal_medical_annual = _annualize_amount(merged.get("sal_medical"), is_monthly=salary_is_monthly)
    sal_conveyance_annual = _annualize_amount(merged.get("sal_conveyance"), is_monthly=salary_is_monthly)
    sal_festival_annual = _annualize_amount(merged.get("sal_festival"), is_monthly=festival_bonus_is_monthly)

    employment_income = (
        sal_basic_annual
        + sal_rent_annual
        + sal_medical_annual
        + sal_conveyance_annual
        + sal_festival_annual
    )

    employment_exempt = compute_employment_exemption(employment_income)
    employment_taxable = max(0.0, employment_income - employment_exempt)

    sal_components = {
        "sal_basic": sal_basic_annual,
        "sal_rent": sal_rent_annual,
        "sal_medical": sal_medical_annual,
        "sal_conveyance": sal_conveyance_annual,
        "sal_festival": sal_festival_annual,
    }
    sal_alloc = _allocate_exemption_by_components(total_exempt=employment_exempt, components=sal_components)
    sal_ex = sal_alloc["exempt"]
    sal_tx = sal_alloc["taxable"]

    policy_key = _normalize_tax_fy(merged.get("tax_fy"))

    assessment_year = (
        safe_str(merged.get("assessment_year"))
        or safe_str(merged.get("assesment_year"))
        or _format_assessment_year(policy_key)
    )

    benefit_war_wounded_ff = bool(merged.get("benefit_war_wounded_ff"))
    benefit_third_gender = bool(merged.get("benefit_third_gender"))
    benefit_parent_of_disabled = bool(merged.get("benefit_parent_of_disabled"))

    inp = TaxInputs(
        taxpayer_category=_coerce_taxpayer_category(merged.get("taxpayer_category")) or "general",
        income_employment=employment_income,
        income_bank_interest=safe_float(merged.get("bank_interest")),
        investment_life=safe_float(merged.get("inv_life")),
        investment_dps=safe_float(merged.get("inv_dps")),
        investment_sanchaypatra=safe_float(merged.get("inv_sanchay")),
    )

    total_income = employment_taxable + safe_float(inp.income_bank_interest)
    total_investment = compute_total_investment(inp)
    taxable_income = compute_taxable_income(
        total_income=total_income,
        policy_key=policy_key,
        category=inp.taxpayer_category,
        war_wounded_ff=benefit_war_wounded_ff,
        third_gender=benefit_third_gender,
        parent_of_disabled=benefit_parent_of_disabled,
    )

    flat_rate = 0.30 if bool(merged.get("nri_non_citizen")) else None
    gross_tax = compute_gross_tax(taxable_income=taxable_income, policy_key=policy_key, flat_rate=flat_rate)

    rebate_info = compute_tax_rebate(total_income=total_income, eligible_investment=total_investment)
    rebate = safe_float(rebate_info.get("rebate"))
    net_tax = max(0.0, gross_tax - rebate)

    minimum_tax = compute_minimum_tax(
        total_income=total_income,
        policy_key=policy_key,
        category=inp.taxpayer_category,
        is_new_taxpayer=bool(merged.get("is_new_taxpayer")),
    )

    regular_tax_payable = max(net_tax, minimum_tax)

    surcharge_info = compute_net_wealth_surcharge(
        tax_payable=regular_tax_payable,
        net_wealth=merged.get("net_wealth"),
        more_than_one_motor_car=bool(merged.get("more_than_one_motor_car")),
        house_area_sqft=merged.get("house_area_sqft"),
    )
    net_wealth_surcharge = safe_float(surcharge_info.get("net_wealth_surcharge"))
    environmental_surcharge = safe_float(merged.get("environmental_surcharge"))
    total_amount_payable = regular_tax_payable + net_wealth_surcharge + environmental_surcharge

    tick_resident = residential_status == "resident"
    tick_non_resident = residential_status == "non_resident"

    tick_individual = taxpayer_status == "individual"
    tick_firm = taxpayer_status == "firm"
    tick_huf = taxpayer_status == "huf"
    tick_others = taxpayer_status == "others"

    inferred_female = gender_norm == "female"
    inferred_senior = (age_years or 0) >= 65 if age_years is not None else False
    inferred_disabled = inp.taxpayer_category == "disabled"

    tick_war_wounded_ff = benefit_war_wounded_ff
    tick_female = bool(merged.get("benefit_female")) if "benefit_female" in merged else inferred_female
    tick_third_gender = benefit_third_gender
    tick_disabled = bool(merged.get("benefit_disabled")) if "benefit_disabled" in merged else inferred_disabled
    tick_senior = bool(merged.get("benefit_senior")) if "benefit_senior" in merged else inferred_senior
    tick_parent_of_disabled = benefit_parent_of_disabled

    context: Dict[str, Any] = {
        **merged,
        "assessment_year": assessment_year,

        "sal_basic": sal_basic_annual,
        "sal_rent": sal_rent_annual,
        "sal_medical": sal_medical_annual,
        "sal_conveyance": sal_conveyance_annual,
        "sal_festival": sal_festival_annual,
        "taxpayer_category": inp.taxpayer_category,
        "tax_fy": policy_key,
        "age_years": age_years,
        "gender": safe_str(getattr(nid, "gender", None)),
        "residential_status": residential_status,
        "taxpayer_status": taxpayer_status,
        "tick_resident": tick_resident,
        "tick_non_resident": tick_non_resident,
        "tick_individual": tick_individual,
        "tick_firm": tick_firm,
        "tick_huf": tick_huf,
        "tick_others": tick_others,
        "tick_war_wounded_ff": tick_war_wounded_ff,
        "tick_female": tick_female,
        "tick_third_gender": tick_third_gender,
        "tick_disabled": tick_disabled,
        "tick_senior": tick_senior,
        "tick_parent_of_disabled": tick_parent_of_disabled,
        "tin_chars": tin_chars,
        **dob_parts,
        "sal_total": employment_income,
        "sal_basic_exempt": sal_ex.get("sal_basic", 0),
        "sal_basic_taxable": sal_tx.get("sal_basic", int(round(sal_basic_annual))),
        "sal_rent_exempt": sal_ex.get("sal_rent", 0),
        "sal_rent_taxable": sal_tx.get("sal_rent", int(round(sal_rent_annual))),
        "sal_medical_exempt": sal_ex.get("sal_medical", 0),
        "sal_medical_taxable": sal_tx.get("sal_medical", int(round(sal_medical_annual))),
        "sal_conveyance_exempt": sal_ex.get("sal_conveyance", 0),
        "sal_conveyance_taxable": sal_tx.get("sal_conveyance", int(round(sal_conveyance_annual))),
        "sal_festival_exempt": sal_ex.get("sal_festival", 0),
        "sal_festival_taxable": sal_tx.get("sal_festival", int(round(sal_festival_annual))),
        "employment_exempt": employment_exempt,
        "employment_taxable": employment_taxable,
        "total_income": total_income,
        "inv_total": total_investment,
        "taxable_income": taxable_income,
        "gross_tax": gross_tax,
        "tax_rebate": rebate,
        "rebate_limit_by_income": safe_float(rebate_info.get("rebate_limit_by_income")),
        "rebate_limit_by_investment": safe_float(rebate_info.get("rebate_limit_by_investment")),
        "rebate_limit_absolute": safe_float(rebate_info.get("rebate_limit_absolute")),
        "net_tax": net_tax,
        "minimum_tax": minimum_tax,
        "tax_payable": regular_tax_payable,
        "net_wealth_surcharge": net_wealth_surcharge,
        "net_wealth_surcharge_rate": safe_float(surcharge_info.get("net_wealth_surcharge_rate")),
        "environmental_surcharge": environmental_surcharge,
        "total_amount_payable": total_amount_payable,
    }

    return context