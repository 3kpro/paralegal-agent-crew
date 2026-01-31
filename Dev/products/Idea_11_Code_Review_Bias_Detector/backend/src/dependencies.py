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
    Checks if the user has an active subscription in the shared profiles table.
    For local development without Supabase, skips subscription check.
    """
    if not supabase:
        # Local development mode - skip subscription check
        return user

    try:
        res = supabase.table("profiles").select("subscription_status").eq("id", user.id).single().execute()
        if not res.data:
            raise HTTPException(status_code=402, detail="Subscription required. No profile found.")

        status = res.data.get("subscription_status")
        if status != "active":
            raise HTTPException(
                status_code=402,
                detail=f"Subscription required. Current status: {status}"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify subscription: {str(e)}")
