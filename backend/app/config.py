from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str

    SECRET_KEY: str
    DATABASE_URL: str
    GROQ_API_KEY: str

    model_config = SettingsConfigDict(
        env_file="app/.env",
        extra="ignore"
    )

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int    


settings = Settings()