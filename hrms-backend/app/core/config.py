from typing import Any

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HRMS Lite Backend"
    API_V1_STR: str = "/api/v1"
    
    # Environment flag (dev or prod)
    ENVIRONMENT: str = "dev"
    
    # Database URL
    DATABASE_URL: str

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
