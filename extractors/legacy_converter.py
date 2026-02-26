import tempfile
import os
import subprocess
import logging

logger = logging.getLogger("calc_server")

EXT_MAP = {
    ".doc": ".docx",
    ".xls": ".xlsx",
    ".ppt": ".pptx"
}

def convert_legacy_file(file_bytes: bytes, ext: str) -> str:
    """
    Конвертирует legacy файл (doc, xls, ppt) в современный формат через LibreOffice.
    Возвращает путь к временному файлу с новым расширением.
    """
    if ext not in EXT_MAP:
        raise ValueError(f"Unsupported legacy format: {ext}")

    target_ext = EXT_MAP[ext]

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    output_dir = tempfile.gettempdir()
    try:
        subprocess.run([
            "libreoffice",
            "--headless",
            "--convert-to", target_ext[1:],  # без точки
            tmp_path,
            "--outdir", output_dir
        ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        base = os.path.splitext(os.path.basename(tmp_path))[0]
        converted_path = os.path.join(output_dir, base + target_ext)
        if not os.path.exists(converted_path):
            raise FileNotFoundError(f"LibreOffice did not produce {converted_path}")
        return converted_path
    except subprocess.CalledProcessError as e:
        logger.error(f"LibreOffice conversion failed for {tmp_path}: {e.stderr.decode()}", exc_info=True)
        raise
    finally:
        os.remove(tmp_path)