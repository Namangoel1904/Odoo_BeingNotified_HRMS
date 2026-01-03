from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class BaseModel:
    """
    Base model class that provides:
    - Integer primary key (internal usage)
    - Public UUID (external usage)
    - Timestamps
    """
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    public_id = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
