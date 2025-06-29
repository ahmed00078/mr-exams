import json
import hashlib
from typing import Any, Optional
from database import get_redis
from config import settings

class CacheManager:
    def __init__(self):
        self.redis = None
    
    async def get_redis(self):
        if not self.redis:
            self.redis = await get_redis()
        return self.redis
    
    def _generate_key(self, prefix: str, **kwargs) -> str:
        """Génère une clé de cache basée sur les paramètres"""
        key_data = json.dumps(kwargs, sort_keys=True, default=str)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()[:8]
        return f"{prefix}:{key_hash}"
    
    async def get(self, key: str) -> Optional[Any]:
        """Récupère une valeur du cache"""
        redis = await self.get_redis()
        value = await redis.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        """Stocke une valeur dans le cache"""
        redis = await self.get_redis()
        if isinstance(value, (dict, list)):
            value = json.dumps(value, default=str)
        await redis.setex(key, ttl, value)
    
    async def delete(self, key: str):
        """Supprime une clé du cache"""
        redis = await self.get_redis()
        await redis.delete(key)
    
    async def cache_search_results(self, search_params: dict, results: dict):
        """Cache les résultats de recherche"""
        key = self._generate_key("search", **search_params)
        await self.set(key, results, settings.cache_ttl_results)
    
    async def get_cached_search(self, search_params: dict) -> Optional[dict]:
        """Récupère les résultats de recherche en cache"""
        key = self._generate_key("search", **search_params)
        return await self.get(key)
    
    async def cache_stats(self, stats_type: str, entity_id: int, year: int, data: dict):
        """Cache les statistiques"""
        key = self._generate_key("stats", type=stats_type, id=entity_id, year=year)
        await self.set(key, data, settings.cache_ttl_stats)
    
    async def get_cached_stats(self, stats_type: str, entity_id: int, year: int) -> Optional[dict]:
        """Récupère les statistiques en cache"""
        key = self._generate_key("stats", type=stats_type, id=entity_id, year=year)
        return await self.get(key)

cache_manager = CacheManager()