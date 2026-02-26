import io
import pdfplumber
import logging

logger = logging.getLogger("calc_server")

def extract_pdf(file_bytes: bytes) -> str:
    """
    Извлекает текст из pdf.
    """
    content = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                content += page.extract_text() or ""
    except Exception as e:
        logger.error("PDF extraction error", exc_info=True)
    return content