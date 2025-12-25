from __future__ import annotations
from pydantic import BaseModel, Field

class NIDSchema(BaseModel):
    name: str = Field(...)
    nid_number: str = Field(...)
    date_of_birth: str = Field(...)
    gender: str = Field(default="Male")

class TINSchema(BaseModel):
    tin_number: str = Field(...)
    tax_zone: str = Field(...)
    tax_circle: str = Field(default="")

class SalarySchema(BaseModel):
    employer_name: str = Field(default="")
    basic_pay: float = Field(...)
    house_rent: float = Field(...)
    medical: float = Field(...)
    festival_bonus: float = Field(...)
    conveyance: float = Field(...)

class BankSchema(BaseModel):
    interest_income: float = Field(...)
    bank_balance: float = Field(default=0.0)

class InsuranceSchema(BaseModel):
    life_insurance_premium: float = Field(...)

class DpsSchema(BaseModel):
    dps_contribution: float = Field(...)

class SanchaypatraSchema(BaseModel):
    sanchaypatra_investment: float = Field(...)

class LoanSchema(BaseModel):
    loan_outstanding: float = Field(...)

__all__ = [
    "NIDSchema",
    "TINSchema",
    "SalarySchema",
    "BankSchema",
    "InsuranceSchema",
    "DpsSchema",
    "SanchaypatraSchema",
    "LoanSchema",
]
