from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
import logging
from extractors import extract_file
from price_calculator import get_price_for_pair, engine, prices_table
from config import config
from models import get_db, Price


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("calc_server")

app = FastAPI(title="Translation Calculator API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,  # ← Из .env!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/calc")
async def calc_translation(
    file: UploadFile = File(...),
    src_lang: str = Form("ru"),
    tgt_lang: str = Form("en")
):
    filename = file.filename
    file_bytes = await file.read()

    try:
        content = extract_file(file_bytes, filename)
    except Exception as e:
        logger.error(f"Extraction failed for {filename}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

    chars = len(content.strip())
    pages = (chars + 1799) // 1800

    price_data = get_price_for_pair(src_lang, tgt_lang, pages)
    if price_data[0] is None:
        raise HTTPException(status_code=400, detail=f"Language pair {src_lang} → {tgt_lang} not available")

    total_price, translator_available, price_per_page = price_data

    return {
        "success": True,
        "format": filename.split(".")[-1].upper(),
        "chars": chars,
        "pages": pages,
        "price": f"{total_price:.2f} BYN",           # Итого
        "price_per_page": f"{price_per_page:.2f}",   # ← НОВОЕ: за 1 страницу
        "translator_available": translator_available  # Доступность переводчика
    }


@app.get("/available-pairs/{src_lang}")
async def get_available_pairs(src_lang: str):
    """Возвращает ВСЕ доступные tgt_lang для src_lang (независимо от is_active)"""
    try:
        conn = engine.connect()
        stmt = select(prices_table.c.tgt_lang, prices_table.c.is_active).where(
            prices_table.c.src_lang == src_lang
        )
        results = conn.execute(stmt).fetchall()
        conn.close()

        available = []
        for tgt_lang, is_active in results:
            available.append({
                "lang": tgt_lang,
                "translator_available": bool(is_active)  # 1→true, 0→false
            })
        return {"available": available}
    except Exception as e:
        logger.error(f"Error getting pairs: {e}")
        return {"available": []}