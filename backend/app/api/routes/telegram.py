from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models import User
from app.services.telegram_service import get_or_create_link_code, regenerate_link_code, unlink_telegram

router = APIRouter(prefix="/telegram", tags=["telegram"])


class TelegramStatus(BaseModel):
    enabled: bool
    connected: bool
    link_code: str | None = None


@router.get("/status", response_model=TelegramStatus)
def get_telegram_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TelegramStatus:
    settings = get_settings()
    link_code = None if current_user.telegram_chat_id else get_or_create_link_code(db, current_user)
    return TelegramStatus(
        enabled=bool(settings.telegram_bot_token and settings.telegram_bot_enabled),
        connected=current_user.telegram_connected,
        link_code=link_code,
    )


@router.post("/link-code", response_model=TelegramStatus)
def create_link_code(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TelegramStatus:
    settings = get_settings()
    code = regenerate_link_code(db, current_user)
    return TelegramStatus(
        enabled=bool(settings.telegram_bot_token and settings.telegram_bot_enabled),
        connected=current_user.telegram_connected,
        link_code=code,
    )


@router.delete("/unlink", response_model=TelegramStatus)
def unlink(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TelegramStatus:
    settings = get_settings()
    user = unlink_telegram(db, current_user)
    return TelegramStatus(
        enabled=bool(settings.telegram_bot_token and settings.telegram_bot_enabled),
        connected=user.telegram_connected,
        link_code=get_or_create_link_code(db, user),
    )
