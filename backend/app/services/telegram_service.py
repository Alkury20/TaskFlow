import asyncio
import secrets
from contextlib import suppress

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import SessionLocal, engine
from app.models import User

dispatcher = Dispatcher()
_polling_task: asyncio.Task[None] | None = None


def ensure_telegram_columns() -> None:
    """Keep existing coursework demo databases compatible without a migration step."""
    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(64)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_link_code VARCHAR(64)",
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_telegram_chat_id ON users (telegram_chat_id)",
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_telegram_link_code ON users (telegram_link_code)",
    ]
    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def _new_link_code() -> str:
    return secrets.token_urlsafe(8)


def get_or_create_link_code(db: Session, user: User) -> str:
    if user.telegram_link_code:
        return user.telegram_link_code

    code = _new_link_code()
    while db.query(User).filter(User.telegram_link_code == code).first():
        code = _new_link_code()

    user.telegram_link_code = code
    db.commit()
    db.refresh(user)
    return code


def regenerate_link_code(db: Session, user: User) -> str:
    user.telegram_link_code = None
    db.flush()
    code = get_or_create_link_code(db, user)
    db.refresh(user)
    return code


def unlink_telegram(db: Session, user: User) -> User:
    user.telegram_chat_id = None
    user.telegram_link_code = None
    db.commit()
    db.refresh(user)
    return user


async def send_telegram_message(chat_id: str, text_message: str) -> None:
    settings = get_settings()
    if not settings.telegram_bot_token:
        return

    bot = Bot(token=settings.telegram_bot_token)
    try:
        await bot.send_message(chat_id=chat_id, text=text_message)
    finally:
        await bot.session.close()


def send_telegram_message_sync(user: User, text_message: str) -> None:
    if not user.telegram_chat_id:
        return

    try:
        asyncio.run(send_telegram_message(user.telegram_chat_id, text_message))
    except Exception:
        # Telegram delivery should not break task or notification operations.
        return


@dispatcher.message(CommandStart())
async def start(message: Message) -> None:
    code = message.text.replace("/start", "", 1).strip() if message.text else ""
    if not code:
        await message.answer("Отправьте команду в формате /start ваш_код из настроек TaskFlow.")
        return

    with SessionLocal() as db:
        user = db.query(User).filter(User.telegram_link_code == code).first()
        if not user:
            await message.answer("Код не найден или уже использован. Сгенерируйте новый код в настройках.")
            return

        user.telegram_chat_id = str(message.chat.id)
        user.telegram_link_code = None
        db.commit()

    await message.answer("Telegram успешно привязан к TaskFlow. Теперь вы будете получать напоминания здесь.")


@dispatcher.message(F.text)
async def fallback(message: Message) -> None:
    await message.answer("Я бот TaskFlow. Для привязки аккаунта используйте /start код_из_настроек.")


async def start_telegram_bot() -> None:
    global _polling_task

    settings = get_settings()
    if not settings.telegram_bot_enabled or not settings.telegram_bot_token or _polling_task:
        return

    bot = Bot(token=settings.telegram_bot_token)
    _polling_task = asyncio.create_task(dispatcher.start_polling(bot))


async def stop_telegram_bot() -> None:
    global _polling_task

    if not _polling_task:
        return

    _polling_task.cancel()
    with suppress(asyncio.CancelledError):
        await _polling_task
    _polling_task = None


def safe_ensure_telegram_columns() -> None:
    try:
        ensure_telegram_columns()
    except SQLAlchemyError:
        return
