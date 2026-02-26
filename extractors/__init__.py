from .docx_extractor import extract_docx
from .xlsx_extractor import extract_xlsx
from .pptx_extractor import extract_pptx
from .pdf_extractor import extract_pdf
from .txt_extractor import extract_txt
from .legacy_converter import convert_legacy_file

import os

def extract_file(file_bytes: bytes, filename: str) -> str:
    """
    Универсальная функция: выбирает правильный extractor.
    Для legacy форматов (.doc, .xls, .ppt) делает конвертацию.
    """
    ext = os.path.splitext(filename.lower())[1]

    if ext == ".docx":
        return extract_docx(file_bytes)
    elif ext == ".xlsx":
        return extract_xlsx(file_bytes)
    elif ext == ".pptx":
        return extract_pptx(file_bytes)
    elif ext == ".pdf":
        return extract_pdf(file_bytes)
    elif ext == ".txt":
        return extract_txt(file_bytes)
    elif ext in [".doc", ".xls", ".ppt"]:
        converted_path = convert_legacy_file(file_bytes, ext)
        try:
            with open(converted_path, "rb") as f:
                converted_bytes = f.read()
            if ext == ".doc":
                return extract_docx(converted_bytes)
            elif ext == ".xls":
                return extract_xlsx(converted_bytes)
            elif ext == ".ppt":
                return extract_pptx(converted_bytes)
        finally:
            if os.path.exists(converted_path):
                os.remove(converted_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")