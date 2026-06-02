from functools import lru_cache

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "TaskFlow API"
    environment: str = "development"
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    backend_cors_origins: list[AnyHttpUrl] | str = "http://localhost:5173"
    telegram_bot_token: str | None = None
    telegram_bot_enabled: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        if isinstance(self.backend_cors_origins, str):
            return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]
        return [str(origin).rstrip("/") for origin in self.backend_cors_origins]


@lru_cache
def get_settings() -> Settings:
    return Settings()
