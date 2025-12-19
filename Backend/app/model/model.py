from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, LargeBinary, DateTime, Date
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "User"

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
    __tablename__ = "Sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"), index=True, nullable=False)
    active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class ChatMessage(Base):
    __tablename__ = "Messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UploadedDocument(Base):
    __tablename__ = "Documents"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("Sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    filename = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    size = Column(Integer, nullable=True)
    content = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())