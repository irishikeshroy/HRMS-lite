import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Enum, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base

class AttendanceStatus(str, enum.Enum):
    present = "Present"
    absent = "Absent"

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationship to the employee model
    employee = relationship("Employee", backref="attendance_records")

    # Composite unique constraint to prevent duplicate attendance marks
    __table_args__ = (
        UniqueConstraint('employee_id', 'date', name='uq_employee_date_attendance'),
    )
