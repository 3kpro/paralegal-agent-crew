try:
    import redis
    from ..config import settings
    
    if settings.REDIS_URL:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    else:
        redis_client = None
except Exception:
    redis_client = None

import json

class CacheService:
    def __init__(self):
        self.client = redis_client
        
    def get_analysis(self, repo_name: str):
        if not self.client:
            return None
        try:
            data = self.client.get(f"analysis:{repo_name}")
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
            
    def set_analysis(self, repo_name: str, data: dict, ttl: int = 3600):
        if not self.client:
            return
        try:
            self.client.setex(f"analysis:{repo_name}", ttl, json.dumps(data))
        except Exception as e:
            print(f"Cache set error: {e}")
