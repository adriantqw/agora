from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "sqlite:///./agora.db"

    # JWT Configuration
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 90

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Global settings instance
settings = Settings()
