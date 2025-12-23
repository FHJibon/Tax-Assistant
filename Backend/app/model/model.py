from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, LargeBinary, DateTime, Date, Float
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class GeneratedFile(Base):
    __tablename__ = "01. Files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    user_name = Column(String(50), nullable=False)
    filename = Column(String, nullable=False)
    session_id = Column(String, nullable=True, index=True)
    mime_type = Column(String, nullable=True)
    size = Column(Integer, nullable=True)
    content = Column(LargeBinary, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "10. User"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    nid = Column(String, nullable=True)
    tin = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    occupation = Column(String, nullable=True)

class ChatSession(Base):
    __tablename__ = "11. Sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("10. User.id", ondelete="CASCADE"), index=True, nullable=False)
    active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class ChatMessage(Base):
    __tablename__ = "12. Messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("11. Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(String, nullable=False)
    voice_transcript = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UploadedDocument(Base):
    __tablename__ = "13. Documents"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("11. Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    filename = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    size = Column(Integer, nullable=True)
    content = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class NidInfo(Base):
    __tablename__ = "21. NidInfo"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("11. Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("10. User.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String, nullable=False)
    nid_number = Column(String, nullable=False)
    date_of_birth = Column(String, nullable=False)
    gender = Column(String, default="Male")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TinInfo(Base):
    __tablename__ = "22. TinInfo"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("11. Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("10. User.id", ondelete="CASCADE"), index=True, nullable=False)
    tin_number = Column(String, nullable=False)
    tax_zone = Column(String, nullable=False)
    tin_circle = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SalaryInfo(Base):
    __tablename__ = "23. SalaryInfo"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("11. Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("10. User.id", ondelete="CASCADE"), index=True, nullable=False)
    employer_name = Column(String, nullable=True)
    basic_pay = Column(Float, nullable=False)
    house_rent = Column(Float, nullable=False)
    medical = Column(Float, nullable=False)
    festival_bonus = Column(Float, nullable=False)
    conveyance = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BankInfo(Base):
    __tablename__ = "24. BankInfo"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("11. Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("10. User.id", ondelete="CASCADE"), index=True, nullable=False)
    interest_income = Column(Float, nullable=False)
    bank_balance = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InsuranceInfo(Base):
    __tablename__ = "25. InsuranceInfo"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("11. Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("10. User.id", ondelete="CASCADE"), index=True, nullable=False)
    life_insurance_premium = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DpsInfo(Base):
    __tablename__ = "26. DpsInfo"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("11. Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("10. User.id", ondelete="CASCADE"), index=True, nullable=False)
    dps_contribution = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SanchaypatraInfo(Base):
    __tablename__ = "27. SavingInfo"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("11. Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("10. User.id", ondelete="CASCADE"), index=True, nullable=False)
    sanchaypatra_investment = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LoanInfo(Base):
    __tablename__ = "28. LoanInfo"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("11. Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("10. User.id", ondelete="CASCADE"), index=True, nullable=False)
    loan_outstanding = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())