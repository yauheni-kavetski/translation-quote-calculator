from sqlalchemy import create_engine, MetaData, Table, select
from sqlalchemy.exc import SQLAlchemyError
from config import config
import logging

logger = logging.getLogger("calc_server")

DB_URL = config.DATABASE_URL
engine = create_engine(DB_URL, echo=False)

metadata = MetaData()
prices_table = Table(
    config.TABLE_NAME,  # ← Из .env!
    metadata,
    autoload_with=engine
)


def get_price_for_pair(src_lang: str, tgt_lang: str, pages: int) -> tuple[float, bool, float]:
    """
    Возвращает (total_price, is_active, price_per_page)
    """
    try:
        conn = engine.connect()
        stmt = select(prices_table.c.price_per_page, prices_table.c.is_active).where(
            (prices_table.c.src_lang == src_lang) &
            (prices_table.c.tgt_lang == tgt_lang)
        )
        result = conn.execute(stmt).fetchone()
        conn.close()

        if not result:
            logger.warning(f"No price found for {src_lang} → {tgt_lang}")
            return None, False, 0.0

        price_per_page, is_active = result
        total_price = float(price_per_page) * pages
        return total_price, bool(is_active), float(price_per_page)

    except SQLAlchemyError as e:
        logger.error(f"Price calculation error: {e}")
        return None, False, 0.0
