from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.notification import NotificationRead
from app.services.notification_service import generate_deadline_reminders, list_notifications, mark_as_read

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationRead])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_notifications(db, current_user)


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = mark_as_read(db, current_user, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.post("/generate-deadline-reminders", response_model=list[NotificationRead])
def generate_reminders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return generate_deadline_reminders(db, current_user)
