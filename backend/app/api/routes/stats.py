from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.stats import StatsRead
from app.services.stats_service import get_stats

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsRead)
def stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_stats(db, current_user)
