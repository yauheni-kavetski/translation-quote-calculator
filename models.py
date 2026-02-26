from sqlalchemy import Column, Integer, String, SmallInteger, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import config

Base = declarative_base()


class Price(Base):
    __tablename__ = config.TABLE_NAME  # ← Из .env!

    id = Column(Integer, primary_key=True)
    src_lang = Column(String(10), index=True)
    tgt_lang = Column(String(10), index=True)
    price_per_page = Column(Float)
    is_active = Column(SmallInteger)


DATABASE_URL = config.DATABASE_URL
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
