from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:wwJnoIKrFtVyOEvctyWbihfUpzHfYnDq@centerbeam.proxy.rlwy.net:45355/railway"
    database_url_async: str = "postgresql+asyncpg://postgres:wwJnoIKrFtVyOEvctyWbihfUpzHfYnDq@centerbeam.proxy.rlwy.net:45355/railway"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # Security
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: list = ["https://exam.ahmed78.me", "http://localhost:3000", "https://127.0.0.1:3000", "https://exam.ahmed78.me/", "https://natijti.com/", , "https://natijti.com", "https://www.natijti.com/", "https://exam.natijti.com/"]
    
    # File Upload
    upload_max_size: int = 50 * 1024 * 1024  # 50MB
    upload_path: str = "./uploads"
    
    # Social Media
    base_url: str = "https://natijti.com/"
    social_share_expire_days: int = 30
    
    # Pagination
    default_page_size: int = 50
    max_page_size: int = 1000
    
    # Cache
    cache_ttl_results: int = 3600  # 1 hour
    cache_ttl_stats: int = 7200    # 2 hours
    
    # Environment
    environment: str = "development"
    debug: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()