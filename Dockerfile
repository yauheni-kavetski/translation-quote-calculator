# --------------------------
# Базовый образ Python 3.11
# --------------------------
FROM python:3.11-slim

# --------------------------
# Устанавливаем системные зависимости
# --------------------------
RUN apt-get update && apt-get install -y \
    build-essential \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libjpeg-dev \
    poppler-utils \
    libreoffice \
    ghostscript \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# --------------------------
# Работа с Python пакетами
# --------------------------
WORKDIR /app
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# --------------------------
# Копируем проект целиком
# --------------------------
COPY calc_server.py .
COPY price_calculator.py .
COPY extractors/ ./extractors/


# --------------------------
# Порт приложения
# --------------------------
EXPOSE 8000

# --------------------------
# Запуск FastAPI
# --------------------------
CMD ["uvicorn", "calc_server:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info", "--reload"]