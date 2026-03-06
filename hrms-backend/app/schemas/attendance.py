from datetime import date, datetime, timezone
from pydantic import BaseModel, field_validator
from typing import List, Optional, Any

from app.models.attendance import AttendanceStatus

class AttendanceBase(BaseModel):
    employee_id: str
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None

class AttendanceResponse(AttendanceBase):
    id: str
    employee_code: str
    full_name: str
    created_at: datetime

    @field_validator('created_at', mode='before')
    @classmethod
    def ensure_utc(cls, v: Any) -> Any:
        if isinstance(v, datetime) and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    class Config:
        orm_mode = True
        from_attributes = True

class PaginatedAttendanceResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[AttendanceResponse]
