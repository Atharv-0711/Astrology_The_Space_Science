from functools import lru_cache

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ModuleNotFoundError:
    from pydantic import BaseModel as BaseSettings

    def SettingsConfigDict(**kwargs: object) -> dict[str, object]:
        return kwargs


class Settings(BaseSettings):
    app_name: str = "Vedic Astrology Platform"
    app_version: str = "0.1.0"
    api_prefix: str = ""
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    database_url: str = "postgresql+psycopg://postgres:postgres@db:5432/astrology"
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    swiss_ephemeris_path: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
