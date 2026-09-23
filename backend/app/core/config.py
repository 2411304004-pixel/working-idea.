import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Cafe on Wheels"
    API_V1_STR: str = "/api"
    
    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "cafe_on_wheels")
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "c4fe-0n-wh33ls-sup3r-s3cur3-jwt-k3y-2026-luxury-noir")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24h
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # PayU (India)
    PAYU_MERCHANT_KEY: str = os.getenv("PAYU_MERCHANT_KEY", "gtKFFx")
    PAYU_MERCHANT_SALT: str = os.getenv("PAYU_MERCHANT_SALT", "eCwWELxi")
    PAYU_BASE_URL: str = os.getenv("PAYU_BASE_URL", "https://test.payu.in/_payment")
    
    # Routing & Weather
    MAPS_API_KEY: str = os.getenv("MAPS_API_KEY", "")
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
