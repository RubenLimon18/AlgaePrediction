from decouple import config

# Mongo 
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi


class Settings:
    # JWT Settings
    JWT_SECRET_KEY: str = config("JWT_SECRET_KEY", default="your-super-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # MongoDB Settings
    MONGODB_URL: str = config("MONGODB_URL", default="mongodb+srv://ruben:tUdDXDmFyiOu6k9m@algae.4qwmjmk.mongodb.net/?retryWrites=true&w=majority&appName=Algae")
    MONGO_CLIENT = MongoClient(MONGODB_URL, server_api=ServerApi('1'))
    DATABASE_NAME: str = config("DATABASE_NAME", default="algaetrack")
    
    # Email Settings
    SMTP_HOST: str = config("SMTP_HOST", default="smtp.gmail.com")
    SMTP_PORT: int = config("SMTP_PORT", default=587, cast=int)
    SMTP_USERNAME: str = config("SMTP_USERNAME", default="")
    SMTP_PASSWORD: str = config("SMTP_PASSWORD", default="")
    FROM_EMAIL: str = config("FROM_EMAIL", default="noreply@algaetrack.com")
    
    # Frontend URL
    FRONTEND_URL: str = config("FRONTEND_URL", default="http://localhost:4200")
    
    # Security
    MAGIC_LINK_EXPIRE_MINUTES: int = 15
    VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
    INVITATION_TOKEN_EXPIRE_DAYS: int = 7

settings = Settings()