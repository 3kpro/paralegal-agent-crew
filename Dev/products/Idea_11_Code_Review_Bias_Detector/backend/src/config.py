import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
    GITLAB_CLIENT_ID: str = os.getenv("GITLAB_CLIENT_ID", "")
    GITLAB_CLIENT_SECRET: str = os.getenv("GITLAB_CLIENT_SECRET", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    API_URL: str = os.getenv("API_URL", "http://localhost:8000")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SUPABASE_URL: str = os.getenv("VITE_SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("VITE_SUPABASE_ANON_KEY", "")
    # Redis disabled by default per user request, but kept for future scale
    REDIS_URL: str = os.getenv("REDIS_URL", "")

settings = Settings()
