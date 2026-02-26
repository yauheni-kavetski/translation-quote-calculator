from pydantic import BaseModel
from typing import List

class AvailablePair(BaseModel):
    lang: str
    translator_available: bool  # ← bool(p.is_active)

class AvailablePairsResponse(BaseModel):
    available: List[AvailablePair]

class CalcResponse(BaseModel):
    success: bool
    format: str
    chars: int
    pages: int
    price: str
    price_per_page: str
    translator_available: bool
