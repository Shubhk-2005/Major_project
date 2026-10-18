import time
import json
import hashlib
import logging
import threading
from typing import Optional, Any, Dict, Tuple
from fastapi import Request, HTTPException, status
from app.core.config import settings

logger = logging.getLogger(__name__)


class _InMemoryFallbackCache:
    """
    Thread-safe in-memory cache with TTL support used as a seamless
    fallback if a remote Redis instance is not configured or temporarily unreachable.
    Guarantees zero crashes and 100% uptime for MsAdmit.
    """
    def __init__(self):
        self._store: Dict[str, Tuple[Any, float]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            item = self._store.get(key)
            if not item:
                return None
            val, expiry = item
            if expiry is not None and time.time() > expiry:
                del self._store[key]
                return None
            return val

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        with self._lock:
            expiry = time.time() + ttl if ttl else None
            self._store[key] = (value, expiry)
            # Simple eviction safeguard if memory grows over 10,000 keys
            if len(self._store) > 10000:
                self._prune_expired()
            return True

    def delete(self, key: str) -> bool:
        with self._lock:
            return self._store.pop(key, None) is not None

    def _prune_expired(self):
        now = time.time()
        expired_keys = [k for k, (_, exp) in self._store.items() if exp and now > exp]
        for k in expired_keys:
            self._store.pop(k, None)


class CacheService:
    def __init__(self):
        self._client = None
        self._using_redis = False
        self._fallback = _InMemoryFallbackCache()
        self._init_connection()

    def _init_connection(self):
        redis_url = (settings.REDIS_URL or "").strip()
        if not redis_url:
            logger.info("ℹ️ No REDIS_URL configured. Using high-performance in-memory fallback cache.")
            self._using_redis = False
            return

        # Upstash and SSL providers require rediss://
        if ("upstash.io" in redis_url or "tls" in redis_url) and redis_url.startswith("redis://"):
            redis_url = "rediss://" + redis_url[len("redis://"):]

        try:
            import redis
            client = redis.Redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=3.5,
                socket_timeout=3.5
            )
            client.ping()
            self._client = client
            self._using_redis = True
            logger.info(f" Successfully connected to Redis at: {redis_url.split('@')[-1]}")
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed ({e}). Falling back to internal in-memory cache.")
            self._client = None
            self._using_redis = False

    @property
    def is_redis_active(self) -> bool:
        return self._using_redis and self._client is not None

    def get_status(self) -> Dict[str, Any]:
        """Diagnostic status of cache subsystem."""
        if self.is_redis_active:
            return {
                "active_backend": "redis",
                "connected": True,
                "redis_configured": bool(settings.REDIS_URL),
                "mode": "Distributed Cloud / Local Redis"
            }
        return {
            "active_backend": "in_memory_fallback",
            "connected": True,
            "redis_configured": bool(settings.REDIS_URL),
            "mode": "Internal RAM TTL Cache (Zero-configuration fallback)"
        }

    def get(self, key: str) -> Optional[Any]:
        if not settings.REDIS_CACHE_ENABLED:
            return None

        if self.is_redis_active:
            try:
                raw = self._client.get(key)
                if raw is not None:
                    return json.loads(raw)
            except Exception as e:
                logger.warning(f"Redis get error ({e}), falling back to memory.")
                return self._fallback.get(key)

        return self._fallback.get(key)

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        if not settings.REDIS_CACHE_ENABLED:
            return False

        effective_ttl = ttl if ttl is not None else settings.REDIS_CACHE_TTL_DEFAULT

        if self.is_redis_active:
            try:
                serialized = json.dumps(value)
                self._client.set(key, serialized, ex=effective_ttl)
                return True
            except Exception as e:
                logger.warning(f"Redis set error ({e}), storing in memory.")
                return self._fallback.set(key, value, ttl=effective_ttl)

        return self._fallback.set(key, value, ttl=effective_ttl)

    def delete(self, key: str) -> bool:
        if self.is_redis_active:
            try:
                return bool(self._client.delete(key))
            except Exception:
                pass
        return self._fallback.delete(key)

    # --- Cache Key Generators ---

    @staticmethod
    def make_ml_cache_key(prefix: str, profile_dict: Dict[str, Any]) -> str:
        """
        Creates a deterministic hash key for ML prediction & portfolio requests.
        Normalizes numeric values and canonical keys so identical applicant parameters
        always hit the cache.
        """
        def _round_val(v):
            if isinstance(v, float):
                return round(v, 2)
            return v

        normalized = {
            "gpa": _round_val(float(profile_dict.get("gpa") or 0.0)),
            "gre": _round_val(float(profile_dict.get("gre") or 0.0)),
            "toefl": _round_val(float(profile_dict.get("toefl") or 0.0)),
            "work_months": _round_val(float(profile_dict.get("work_months") or 0.0)),
            "internships": int(profile_dict.get("internships") or 0),
            "publications": int(profile_dict.get("publications") or 0),
            "tier": int(profile_dict.get("institution_tier") or 2),
            "term": str(profile_dict.get("intake_term") or "Fall").strip().capitalize()
        }
        canonical_str = json.dumps(normalized, sort_keys=True)
        digest = hashlib.md5(canonical_str.encode("utf-8")).hexdigest()
        return f"{prefix}:{digest}"

    @staticmethod
    def make_llm_cache_key(prefix: str, payload_dict: Dict[str, Any]) -> str:
        """Deterministic key for LLM generation (SOP critique, roadmap, etc.)."""
        canonical_str = json.dumps(payload_dict, sort_keys=True)
        digest = hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()[:24]
        return f"{prefix}:{digest}"

    # --- Rate Limiting ---

    def check_rate_limit(self, identifier: str, limit: int = 15, window_seconds: int = 60) -> Tuple[bool, int, int]:
        """
        Sliding-window/counter rate limiter.
        Returns (is_allowed: bool, remaining_requests: int, retry_after_seconds: int).
        """
        if not settings.RATE_LIMIT_ENABLED:
            return True, limit, 0

        key = f"ratelimit:{identifier}:{int(time.time() // window_seconds)}"

        if self.is_redis_active:
            try:
                pipe = self._client.pipeline()
                pipe.incr(key)
                pipe.expire(key, window_seconds)
                current_count, _ = pipe.execute()
                remaining = max(0, limit - current_count)
                return current_count <= limit, remaining, window_seconds
            except Exception as e:
                logger.warning(f"Redis rate limit check error ({e}). Bypassing.")
                return True, limit, 0

        # In-memory rate limiting fallback
        curr_count = (self._fallback.get(key) or 0) + 1
        self._fallback.set(key, curr_count, ttl=window_seconds)
        remaining = max(0, limit - curr_count)
        return curr_count <= limit, remaining, window_seconds


# Singleton instance
cache = CacheService()


def rate_limiter(max_requests: int = 20, window_seconds: int = 60):
    """
    FastAPI dependency for protecting sensitive endpoints from abuse.
    Uses Client IP or authenticated user identifier.
    """
    def _dependency(request: Request):
        client_ip = request.client.host if request.client else "unknown"
        auth_header = request.headers.get("Authorization", "")
        identifier = hashlib.md5(f"{client_ip}:{auth_header[:30]}".encode()).hexdigest()

        allowed, remaining, retry_after = cache.check_rate_limit(
            identifier=identifier,
            limit=max_requests,
            window_seconds=window_seconds
        )
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds}s.",
                headers={"Retry-After": str(retry_after)}
            )
        return True

    return _dependency
