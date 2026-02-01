from fastapi import Header, HTTPException, Depends
from supabase import create_client, Client
from .config import settings

# Initialize Supabase client (optional for local development)
supabase: Client = None
if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

async def get_current_user(authorization: str = Header(None)):
    """
    Verifies the Supabase JWT from the Authorization header.
    Returns the user data if valid.
    For local development without Supabase, returns a mock user.
    """
    if not supabase:
        # Local development mode - skip auth
        return {"id": "local-dev-user", "email": "dev@localhost"}

    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        res = supabase.auth.get_user(token)
        if not res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return res.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

async def verify_subscription(user = Depends(get_current_user)):
    """
    Skipped for testing - allows all users to access analysis endpoints.
    TODO: Restore subscription check after testing phase.
    """
    return user
