from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://localhost:6379/0"

    eia_api_key: str = ""
    gdelt_base_url: str = "https://api.gdeltproject.org/api/v2"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"

    env: str = "development"
    cors_origins: str = "http://localhost:5173"
    risk_model_path: str = "ml/artifacts/risk_model.joblib"

    jwt_secret_key: str = "dev-only-insecure-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
