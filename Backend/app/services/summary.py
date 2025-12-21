from __future__ import annotations
from enum import Enum
from typing import Optional, Any, Dict
from openai import AsyncOpenAI
from app.core.config import OPENAI_API_KEY, GPT_MODEL
from app.schemas.tax_schema import (
    NIDSchema,
    TINSchema,
    SalarySchema,
    BankSchema,
    InsuranceSchema,
    DpsSchema,
    SanchaypatraSchema,
    LoanSchema,
)

_client: Optional[AsyncOpenAI] = None

def _get_client() -> Optional[AsyncOpenAI]:
    global _client
    if not OPENAI_API_KEY:
        return None
    if _client is None:
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _client

def _detect_language(text: str) -> str:
    for ch in text:
        if 0x0980 <= ord(ch) <= 0x09FF:
            return "bn"
    return "en"

async def summarize(
    *,
    filename: str,
    text: str,
    max_input_tokens: int = 1000,
) -> Optional[str]:
    client = _get_client()
    if client is None:
        return None

    cleaned = (text or "").strip()
    if not cleaned:
        return None

    lang = _detect_language(cleaned)
    target_lang = "Bangla" if lang == "bn" else "English"

    system = (
        "You summarize user-provided documents for a tax assistant app. "
        "Be factual, do not invent data, and clearly mark unknowns. "
        f"Write only in {target_lang}."
    )

    prompt = (
        f"File: {filename}\n"
        "You are given a document."
        "Output format (Markdown file):"
        "-Title: <short>"
        "-Overview: 4-5 sentences maximum"
        f"""{cleaned}"""
    )

    res = await client.chat.completions.create(
        model=GPT_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=800,
    )
    return (res.choices[0].message.content or "").strip()


class DocType(str, Enum):
    NID = "nid"
    TIN = "tin"
    SALARY = "salary"
    BANK = "bank"
    INSURANCE = "insurance"
    DPS = "dps"
    SANCHAYPATRA = "sanchaypatra"
    LOAN = "loan"
    UNKNOWN = "unknown"

SCHEMAS: Dict[DocType, Any] = {
    DocType.NID: NIDSchema,
    DocType.TIN: TINSchema,
    DocType.SALARY: SalarySchema,
    DocType.BANK: BankSchema,
    DocType.INSURANCE: InsuranceSchema,
    DocType.DPS: DpsSchema,
    DocType.SANCHAYPATRA: SanchaypatraSchema,
    DocType.LOAN: LoanSchema,
}


async def identify_document_type(raw_text: str) -> DocType:
    cleaned = (raw_text or "").strip()
    if not cleaned:
        return DocType.UNKNOWN

    client = _get_client()
    if client is None:
        return DocType.UNKNOWN

    system = (
        "You classify Bangladeshi tax-related documents based on their text. "
        "Return exactly one of these labels in lowercase and nothing else: "
        "nid, tin, salary, bank, insurance, dps, sanchaypatra, loan, unknown."
    )
    user = (
        "Given the following document text, identify which single label from the allowed list best describes it. "
        "If you are not sure, respond with 'unknown'.\n\n"
        f"Document:\n{cleaned}"
    )

    try:
        resp = await client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.0,
            max_tokens=800,
        )
    except Exception:
        return DocType.UNKNOWN

    content = (resp.choices[0].message.content or "").strip().lower()
    for dt in DocType:
        if content == dt.value:
            return dt
    for dt in DocType:
        if dt.value in content:
            return dt
    return DocType.UNKNOWN


async def extract_structured_data(raw_text: str, doc_type: DocType) -> Optional[Dict[str, Any]]:
    if doc_type == DocType.UNKNOWN:
        return None

    model_cls = SCHEMAS.get(doc_type)
    if model_cls is None:
        return None

    cleaned = (raw_text or "").strip()
    if not cleaned:
        return None

    client = _get_client()
    if client is None:
        return None

    system = (
        "You extract structured JSON for Bangladeshi tax documents. "
        "Only use the fields from the provided schema. Do not invent extra keys. "
        "If a value is missing, always use 0.0 for numbers and empty string for text. "
        "All string values must be in English, even if the source document is in Bangla. "
        "Output must be valid JSON."
    )

    example_jsons = {
        DocType.SALARY: '{"employer_name": "Desco Ltd", "basic_pay": 1000, "house_rent": 100, "medical": 100, "festival_bonus": 100, "conveyance": 100}',
        DocType.NID: '{"name": "Jack", "nid_number": "12334567889", "date_of_birth": "1990-01-01"}',
        DocType.TIN: '{"tin_number": "123456789912", "tax_zone": "Dhaka", "tin_circle": "dhaka"}',
        DocType.BANK: '{"interest_income": 200, "bank_balance": 5000}',
        DocType.INSURANCE: '{"life_insurance_premium": 150}',
        DocType.DPS: '{"dps_contribution": 300}',
        DocType.SANCHAYPATRA: '{"sanchaypatra_investment": 250}',
        DocType.LOAN: '{"loan_outstanding": 5000}',
    }
    example = example_jsons.get(doc_type, "{}")

    user = (
        f"Document type: {doc_type.value}.\n"
        "Return a JSON object with exactly the fields of the schema.\n"
        f"Example: {example}\n\n"
        f"Document text:\n{cleaned}"
    )

    try:
        resp = await client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0,
            response_format={"type": "json_object"},
            max_tokens=1200,
        )
    except Exception:
        return None

    content = (resp.choices[0].message.content or "").strip()
    try:
        data = model_cls.model_validate_json(content)
    except Exception:
        return None
    return data.model_dump()