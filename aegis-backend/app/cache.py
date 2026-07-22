import json
import redis
from functools import wraps

from app.config import get_settings

settings = get_settings()
_redis_client = redis.from_url(settings.redis_url, decode_responses=True)


def get_redis():
    return _redis_client


def cached(key_prefix: str, ttl_seconds: int = 300):
    """
    Decorator for caching the JSON-serializable result of an async function.
    Use on any function that calls an external API (EIA, GDELT) or does
    expensive DB aggregation. TTL defaults to 5 minutes.
    """
    def decorator(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            key_payload = {"args": args, "kwargs": kwargs}
            cache_key = f"{key_prefix}:{json.dumps(key_payload, sort_keys=True, default=str)}"
            cached_val = _redis_client.get(cache_key)
            if cached_val is not None:
                return json.loads(cached_val)
            result = await fn(*args, **kwargs)
            _redis_client.setex(cache_key, ttl_seconds, json.dumps(result, default=str))
            return result
        return wrapper
    return decorator
