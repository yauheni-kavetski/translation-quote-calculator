def extract_txt(file_bytes: bytes) -> str:
    """
    Извлекает текст из txt, пытается utf-8, fallback cp1251.
    """
    try:
        return file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return file_bytes.decode("cp1251", errors="ignore")