from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas import employee as schemas
from app.crud import attendance as crud

router = APIRouter()

@router.get("/", response_model=schemas.DashboardStats)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get summary stats for the dashboard."""
    return crud.get_dashboard_stats(db)

@router.get("/today-attendance", response_model=List[schemas.TodayAttendanceRecord])
def get_today_attendance(db: Session = Depends(get_db)):
    """Return today's attendance enriched with employee code and name."""
    return crud.get_today_attendance_enriched(db)
