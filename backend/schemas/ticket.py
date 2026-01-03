from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class TicketStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class TicketCreate(BaseModel):
    category: str
    subject: str
    description: str

class TicketResponse(BaseModel):
    public_id: str
    category: str
    subject: str
    description: str
    status: TicketStatus
    created_at: datetime
    resolution: Optional[str] = None
    
    class Config:
        from_attributes = True
