# 🚀 Калькулятор стоимости перевода - Translation Cost Calculator API

FastAPI +SQLAlchemy + Docker + Server DB + Современный UI | Анализ TTX/PDF/DOCX/XLSX/PPTX/DOC/XLS/PPT + цены из БД SQL (любая SQL БД)

## ✨ Что делает проект
📊 Анализ реальных документов (символы → страницы) | 🌐 Динамические языковые пары из БД | 💰 Точная цена + статус переводчика | 🎨 TomSelect UI с флагами
На фронтенде создается html-форма (/frontend/form.html), которая подключается к js-скрипту (/frontend/calc_form.js). В них надо установить пути к вашему серверу
На сервере через docker compose собираем бэкенд. FastAPI самостоятельно собирает swagger - удобно при настройке и тестировании.
Основная логика API в calc_server.py. Отдаем через форму файл (у меня до 20MB - настраивается в вашем nginx или, как у меня, 
в proxy-файле к нему строка client_max_body_size 20M;). Допустимые форматы файлов TTX/DOCX/PDF/XLSX/PPTX/DOC/XLS/PPT. В папке extractors находятся функции,
отвечающие за подсчет символов в разных типах файлов. Файл price_calculator.py обращается к БД с использованием полученных из формы языков для
оценки доступности языковой пары и определения цены. На основании полученной цены и количества знаков выполняется расчет стоимости перевода текстов 
в определенной языковой паре (которая выбрана в форме). Также в БД есть параметр is_active (0 или 1), определяющий доступности переводчика, на основании чего в форме выводится
сообщение о его доступности или возможной недоступности - предлагается уточнить. В ответе форму выводим кол-во знаков, кол-во расчетных страниц, 
цену одной страницы перевода и общую стоимость, а также информацию о доступности переводчика.
Эндпоинт available-pairs получает из формы язык оригинала, проверяет, пары с какими языками перевода есть для этого языка в БД, отдает данные в js -> форму,
после чего в форме для выбора в поле "язык перевода" пользователю предлагаются только языки из найденных пар. То есть, невозможно выбрать в форме
такую языковую пару, цена для которой не предусмотрена в БД.


Демо: contract.docx (1247 симв = 2.49 стр) | ru→en | 1245 RUB (500 RUB/стр) | ✅ Доступен 

## 📂 Структура проекта
translation-calc/
├── .gitignore              # Секреты в .env
├── .env_template          # Шаблон конфигурации
├── config.py              # DB_HOST/TABLE_NAME/CORS из .env
├── docker-compose.yml     # MySQL 8 + FastAPI
├── calc_server.py         # FastAPI сервер
├── models.py              # SQLAlchemy (таблица из .env)
├── price_calculator.py    # Анализ + расчёт цены
└── frontend/
    ├── form.html         # Готовый HTML
    └── calc_form.js    # TomSelect + API
└── extractors/    
    ├── __init__.py         # универсально для всех форматов - парсинг
    ├── legacy_converter.py    # преобразование DOCX/XLSX/PPTX -> DOC/XLS/PPT (на сервере libreoffice-headless)
    ├── docx_extractor.py   # подсчет символов в docx
    ├── pdf_extractor.py   # подсчет символов в pdf
    ├── pptx_extractor.py   # подсчет символов в pptx
    ├── xlsx_extractor.py   # подсчет символов в xlsx
    └── txt_extractor.py   # подсчет символов в txt

## 🚀 Быстрый старт (5 минут)
1. git clone <repo> && cd translation-calc
2. cp .env_template .env
3. Заполни .env:
   DB_HOST=your_host
   DB_USER=your_user
   DB_PASSWORD=your_pass
   DB_NAME=your_database
   TABLE_NAME=your_prices_table
   CORS_ORIGINS=https://your-site.com
4. docker-compose up -d
5. Backend: http://localhost:8000/docs
6. Frontend: open frontend/index.html

## 🔧 Настройка под ТЕБЯ
Backend (.env):
DB_NAME=your_database_name
TABLE_NAME=your_prices_table_name  
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

Frontend (calc_form.js → строка 1):
const API_BASE_URL = "https://api.your-domain.com";

## 🧪 API Тесты
curl http://localhost:8000/available-pairs/ru
→ {"available": [{"lang":"en"},{"lang":"pl"},{"lang":"de"}]}

curl http://localhost:8000/calc
→ {"price":12.45,"pages":2.49}

Swagger: http://localhost:8000/docs

## 🗄️ Твоя таблица БД
CREATE TABLE your_prices_table (
  id INT PRIMARY KEY,
  src_lang VARCHAR(10),      # ru,en,pl,de...
  tgt_lang VARCHAR(10),      # en,fr,de...
  price_per_page DECIMAL(10,2), # 5.00 RUB
  is_active TINYINT          # 1=да, 0=нет
);

Примеры: ru→en:5.00(1) | ru→de:4.50(1) | fr→ru:7.00(0)

## 📱 Форматы файлов
|Формат|Символов/стр|Библиотека|
|------|------------|----------|
|.docx |1800        |python-docx|
|.pdf  |1800        |PyMuPDF|
|.xlsx |2500        |openpyxl|
|.pptx |1200        |python-pptx|
|.txt  |1800        |встроенная|

## 🔍 API Endpoints
POST /calc              → {"price":12.45,"pages":2.49}
GET  /available-pairs   → {"available": [{"lang": "ru", "translator_available": true}]} доступные tgt языки
GET  /docs              → Swagger UI

## 🛠️ Технологии
Backend: FastAPI+SQLAlchemy+Pydantic+SQL
Frontend: VanillaJS+TomSelect2.3.1+CSS+HTML
Docker: Compose+Multi-stage

## 🚀 Продакшен
VPS: git clone → docker-compose up -d → nginx proxy 8000 → SSL
Cloud: Render/DO → docker-compose → port 8000

## 🤝 Разработчикам
docker-compose up --build    # Сборка
docker-compose logs -f       # Логи
docker-compose exec app bash # Shell

## 📈 Скорость
DOCX(10стр):120ms | PDF(10стр):250ms | БД:2ms | RAM:150MB

## 🔒 Безопасность
✅ Нет секретов в Git (.env→.gitignore)
✅ CORS только твои домены
✅ Файлы до 20MB + проверка типов
✅ SQLAlchemy ORM защита

## 🎨 Кастомизация
Языки: frontend/js/calc_form.js→allLanguages + БД
Стили: frontend/index.html (inline CSS)
API: calc_form.js строка 1

## 📄 Лицензия
MIT - используй свободно в коммерции!

⭐ Star если помогло! 🔗 Форк под свои цены!
© 2026 Translation Calc для бюро переводов.
