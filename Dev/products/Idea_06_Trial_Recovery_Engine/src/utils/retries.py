import time
import logging
from functools import wraps
from typing import Callable, Any

logger = logging.getLogger(__name__)

def retry_with_backoff(retries: int = 3, backoff_in_seconds: int = 1):
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            x = 0
            while True:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if x == retries:
                        logger.error(f"Function {func.__name__} failed after {retries} retries. Error: {e}")
                        raise e
                    
                    sleep = (backoff_in_seconds * 2 ** x)
                    logger.warning(f"Retrying {func.__name__} in {sleep}s... (Attempt {x+1}/{retries})")
                    time.sleep(sleep)
                    x += 1
        return wrapper
    return decorator

async def async_retry_with_backoff(retries: int = 3, backoff_in_seconds: int = 1):
    import asyncio
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            x = 0
            while True:
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if x == retries:
                        logger.error(f"Async Function {func.__name__} failed after {retries} retries. Error: {e}")
                        raise e
                    
                    sleep = (backoff_in_seconds * 2 ** x)
                    logger.warning(f"Retrying {func.__name__} in {sleep}s... (Attempt {x+1}/{retries})")
                    await asyncio.sleep(sleep)
                    x += 1
        return wrapper
    return decorator
