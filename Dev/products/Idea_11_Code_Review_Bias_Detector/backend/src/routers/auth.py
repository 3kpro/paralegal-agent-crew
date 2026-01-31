from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
import requests
from ..config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"

GITLAB_AUTH_URL = "https://gitlab.com/oauth/authorize"
GITLAB_TOKEN_URL = "https://gitlab.com/oauth/token"

@router.get("/login")
def login():
    """Redirects user to GitHub for authentication."""
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub Client ID not configured")
    
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": f"{settings.API_URL}/auth/callback",
        "scope": "repo user:email read:org", # Scopes for code review analysis
    }
    
    url = f"{GITHUB_AUTH_URL}?client_id={params['client_id']}&redirect_uri={params['redirect_uri']}&scope={params['scope']}"
    return RedirectResponse(url)

@router.get("/gitlab/login")
def gitlab_login():
    """Redirects user to GitLab for authentication."""
    if not settings.GITLAB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitLab Client ID not configured")
    
    params = {
        "client_id": settings.GITLAB_CLIENT_ID,
        "redirect_uri": f"{settings.API_URL}/auth/gitlab/callback",
        "response_type": "code",
        "scope": "read_user read_api",
    }
    
    url = f"{GITLAB_AUTH_URL}?client_id={params['client_id']}&redirect_uri={params['redirect_uri']}&response_type=code&scope={params['scope']}"
    return RedirectResponse(url)

@router.get("/callback")
def callback(code: str):
    """Handles the callback from GitHub."""
    if not code:
        raise HTTPException(status_code=400, detail="Code not provided")
        
    # Exchange code for access token
    headers = {"Accept": "application/json"}
    data = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": f"{settings.API_URL}/auth/callback",
    }
    
    response = requests.post(GITHUB_TOKEN_URL, headers=headers, data=data)
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to retrieve access token")
        
    token_data = response.json()
    access_token = token_data.get("access_token")
    
    if not access_token:
        error_desc = token_data.get("error_description", "Unknown error")
        raise HTTPException(status_code=400, detail=f"GitHub Error: {error_desc}")
    
    frontend_redirect = f"{settings.FRONTEND_URL}/dashboard?token={access_token}&platform=github"
    return RedirectResponse(frontend_redirect)

@router.get("/gitlab/callback")
def gitlab_callback(code: str):
    """Handles the callback from GitLab."""
    if not code:
        raise HTTPException(status_code=400, detail="Code not provided")
        
    # Exchange code for access token
    data = {
        "client_id": settings.GITLAB_CLIENT_ID,
        "client_secret": settings.GITLAB_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": f"{settings.API_URL}/auth/gitlab/callback",
    }
    
    response = requests.post(GITLAB_TOKEN_URL, data=data)
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to retrieve access token")
        
    token_data = response.json()
    access_token = token_data.get("access_token")
    
    if not access_token:
        error_desc = token_data.get("error_description", "Unknown error")
        raise HTTPException(status_code=400, detail=f"GitLab Error: {error_desc}")
    
    frontend_redirect = f"{settings.FRONTEND_URL}/dashboard?token={access_token}&platform=gitlab"
    return RedirectResponse(frontend_redirect)
