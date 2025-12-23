from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field

class GenerateTaxReturnRequest(BaseModel):
    name: Optional[str] = None
    nid: Optional[str] = None
    tin: Optional[str] = None
    circle: Optional[str] = None
    zone: Optional[str] = None
    date_of_birth: Optional[str] = Field(default=None, description="YYYY-MM-DD")
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    employer: Optional[str] = None

    taxpayer_category: Optional[str] = Field(default=None, description="general | women_senior | disabled")

    sal_basic: Optional[float] = None
    sal_rent: Optional[float] = None
    sal_medical: Optional[float] = None
    sal_conveyance: Optional[float] = None
    sal_festival: Optional[float] = None

    bank_interest: Optional[float] = None
    bank_balance: Optional[float] = None
    loan_outstanding: Optional[float] = None

    inv_life: Optional[float] = None
    inv_dps: Optional[float] = None
    inv_sanchay: Optional[float] = None

__all__ = ["GenerateTaxReturnRequest"]