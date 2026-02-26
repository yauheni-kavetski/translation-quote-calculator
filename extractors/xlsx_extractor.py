import io
import openpyxl

def extract_xlsx(file_bytes: bytes) -> str:
    """
    Извлекает текст из xlsx.
    """
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
    content = ""
    for sheet in wb.worksheets:
        for row in sheet.iter_rows(values_only=True):
            row_text = " ".join(str(cell) for cell in row if cell is not None)
            if row_text.strip():
                content += row_text + "\n"
    return content