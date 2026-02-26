import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # База данных
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")
    TABLE_NAME = os.getenv("TABLE_NAME", "prices")

    @property
    def DATABASE_URL(self):
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # FastAPI
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))

    # CORS (пустой дефолт!)
    @property
    def CORS_ORIGINS(self):
        origins = os.getenv("CORS_ORIGINS")
        if not origins:
            return ["*"]  # Разрешаем всё если не настроено
        return [o.strip() for o in origins.split(",")]


config = Config()
