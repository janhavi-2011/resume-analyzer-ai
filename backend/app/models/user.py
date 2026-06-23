# app/models/user.py

import uuid
from sqlalchemy import Column, String, DateTime, func, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Plan tier
    plan = Column(String, default="free", nullable=False)  # "free" or "pro"

    # Rate limiting
    ai_calls_count = Column(Integer, default=0, nullable=False)
    ai_calls_reset_at = Column(DateTime(timezone=True), server_default=func.now())