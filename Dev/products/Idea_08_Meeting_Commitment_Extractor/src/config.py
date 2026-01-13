from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "PactPull API"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/pactpull"
    DEEPGRAM_API_KEY: str
    ANTHROPIC_API_KEY: str
    ASANA_ACCESS_TOKEN: str
    ASANA_WORKSPACE_GID: str = "" # Optional, if needed to disambiguate
    ASANA_PROJECT_GID: str = ""   # Default project to add tasks to
    LINEAR_API_KEY: str = ""      # Linear Personal API Key
    LINEAR_TEAM_ID: str = ""      # Default Team ID to add issues to
    SLACK_BOT_TOKEN: str = ""
    SLACK_CHANNEL_ID: str = ""
    UPLOAD_DIR: str = "uploads"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

@lru_cache
def get_settings():
    return Settings()
