from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./resume_analyzer.db"
    
    SECRET_KEY: str = "mysecretkey"
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

     # MongoDB
    MONGODB_URI: str
    MONGODB_DB: str = "resume_ai"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    CLOUDINARY_FOLDER: str = "resume_ai"

    # Gemini 
    GEMINI_API_KEY: str                    
    AI_DAILY_LIMIT: int = 10


    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()