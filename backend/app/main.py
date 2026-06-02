from fastapi import FastAPI

from app.api.routes import auth, categories, notifications, stats, tasks, telegram
from app.core.config import get_settings
from app.core.cors import setup_cors
from app.db.base import Base
from app.db.session import engine
from app.services.telegram_service import safe_ensure_telegram_columns, start_telegram_bot, stop_telegram_bot


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="1.0.0")
    setup_cors(app)

    # Alembic is configured for production migrations; this keeps coursework demo startup simple.
    Base.metadata.create_all(bind=engine)
    safe_ensure_telegram_columns()

    app.include_router(auth.router)
    app.include_router(tasks.router)
    app.include_router(categories.router)
    app.include_router(notifications.router)
    app.include_router(stats.router)
    app.include_router(telegram.router)

    @app.on_event("startup")
    async def startup() -> None:
        await start_telegram_bot()

    @app.on_event("shutdown")
    async def shutdown() -> None:
        await stop_telegram_bot()

    @app.get("/health", tags=["system"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
