from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db, AsyncSessionLocal
from ..models.domain import User

security = HTTPBearer()

async def get_current_user_from_token(token: str, db: AsyncSession) -> User:
    # ---------------------------------------------------------
    # MOCK AUTH IMPLEMENTATION FOR MVP
    # In a real app, this would verify JWT/OAuth token
    # For now, we assume the token IS the user_id (int) or email
    # ---------------------------------------------------------
    
    # 1. Try treating token as direct User ID
    try:
        user_id = int(token)
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            return user
    except ValueError:
        pass
    
    # 2. Try treating token as Email
    result = await db.execute(select(User).where(User.email == token))
    user = result.scalar_one_or_none()
    
    if not user:
        # 3. Auto-create user for testing (Optional MVP convenience)
        # In prod, raise 401
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    return await get_current_user_from_token(token, db)

async def get_optional_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User | None:
    # Check for Authorization header manually without raising 403
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    try:
        return await get_current_user_from_token(token, db)
    except HTTPException:
        return None
