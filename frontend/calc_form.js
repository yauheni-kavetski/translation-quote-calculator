// 🔥 ЗАМЕНИТЕ НА СВОЙ API URL!
const API_BASE_URL = "https://your-api.example.com";

setTimeout(function() {
    const form = document.getElementById("calcForm");
    const resultDiv = document.getElementById("result");

    // Список всех языков
    const allLanguages = {
        "ru": { text: "Русский", flag: "🇷🇺" },
        "be": { text: "Белорусский", flag: "🇧🇾" },
        "en": { text: "Английский", flag: "🇬🇧" },
        "pl": { text: "Польский", flag: "🇵🇱" },
        "de": { text: "Немецкий", flag: "🇩🇪" },
        "es": { text: "Испанский", flag: "🇪🇸" },
        "fr": { text: "Французский", flag: "🇫🇷" },
        "it": { text: "Итальянский", flag: "🇮🇹" },
        "pt": { text: "Португальский", flag: "🇵🇹" },
        "az": { text: "Азербайджанский", flag: "🇦🇿" },
        "ar": { text: "Арабский", flag: "🇸🇦" },
        "hy": { text: "Армянский", flag: "🇦🇲" },
        "hu": { text: "Венгерский", flag: "🇭🇺" },
        "nl": { text: "Нидерландский", flag: "🇳🇱" },
        "ka": { text: "Грузинский", flag: "🇬🇪" },
        "da": { text: "Датский", flag: "🇩🇰" },
        "zh": { text: "Китайский", flag: "🇨🇳" },
        "ko": { text: "Корейский", flag: "🇰🇷" },
        "lv": { text: "Латышский", flag: "🇱🇻" },
        "lt": { text: "Литовский", flag: "🇱🇹" },
        "mk": { text: "Македонский", flag: "🇲🇰" },
        "md": { text: "Молдавский", flag: "🇲🇩" },
        "no": { text: "Норвежский", flag: "🇳🇴" },
        "ro": { text: "Румынский", flag: "🇷🇴" },
        "sr": { text: "Сербский", flag: "🇷🇸" },
        "sk": { text: "Словацкий", flag: "🇸🇰" },
        "sl": { text: "Словенский", flag: "🇸🇮" },
        "tg": { text: "Таджикский", flag: "🇹🇯" },
        "tr": { text: "Турецкий", flag: "🇹🇷" },
        "uz": { text: "Узбекский", flag: "🇺🇿" },
        "uk": { text: "Украинский", flag: "🇺🇦" },
        "fi": { text: "Финский", flag: "🇫🇮" },
        "hr": { text: "Хорватский", flag: "🇭🇷" },
        "cs": { text: "Чешский", flag: "🇨🇿" },
        "sv": { text: "Шведский", flag: "🇸🇪" },
        "et": { text: "Эстонский", flag: "🇪🇪" },
        "ja": { text: "Японский", flag: "🇯🇵" },
        "kk": { text: "Казахский", flag: "🇰🇿" }
    };

    // 1. TomSelect ПЕРВЫМИ
    const src = new TomSelect("#src_lang", {
        render: {
            option: function(data, escape) {
                if (!data.value) return `<div>${escape(data.text)}</div>`;
                const lang = allLanguages[data.value];
                return `<div>${lang.flag} ${escape(lang.text)}</div>`;
            },
            item: function(data, escape) {
                if (!data.value) return `<div>${escape(data.text)}</div>`;
                const lang = allLanguages[data.value];
                return `<div>${lang.flag} ${escape(lang.text)}</div>`;
            }
        }
    });

    const tgt = new TomSelect("#tgt_lang", {
        render: src.settings.render
    });

    // 2. Функции
    function preventSameLanguages() {
        if (src.getValue() === tgt.getValue() && src.getValue()) {
            tgt.clear();
        }
    }

    async function updateTargetLanguages(srcLang) {
        if (!srcLang) {
            const options = [{value: "", text: "Выберите язык"}];
            Object.keys(allLanguages).forEach(code => {
                options.push({value: code, text: allLanguages[code].text});
            });
            tgt.clearOptions();
            tgt.addOptions(options);
            tgt.clear();
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/available-pairs/${srcLang}`);
            const data = await response.json();

            const availableOptions = [{value: "", text: "Выберите язык"}];
            data.available.forEach(item => {
                const code = item.lang;
                if (allLanguages[code]) {
                    availableOptions.push({
                        value: code,
                        text: allLanguages[code].text
                    });
                }
            });

            tgt.clearOptions();
            tgt.addOptions(availableOptions);
            tgt.clear();
            preventSameLanguages();

        } catch (error) {
            console.error("Ошибка загрузки пар:", error);
            const options = Object.keys(allLanguages).map(code => ({
                value: code, text: allLanguages[code].text
            }));
            tgt.clearOptions();
            tgt.addOptions([{value: "", text: "Выберите язык"}, ...options]);
        }
    }

    // 3. Обработчики ПОСЛЕ TomSelect
    src.on("change", function() {
        const srcVal = this.getValue();
        tgt.clear();
        tgt.clearOptions();
        updateTargetLanguages(srcVal);
        preventSameLanguages();
    });

    tgt.on("change", preventSameLanguages);

    // 4. Swap кнопка
    document.getElementById("swapLangs").addEventListener("click", function() {
        const srcVal = src.getValue();
        const tgtVal = tgt.getValue();

        if (!srcVal || !tgtVal) return;

        // Меняем БЕЗ триггера событий
        src.setValue(tgtVal, false);
        tgt.setValue("");  // ← СБРАСЫВАЕМ target!

        // Обновляем список для нового source
        setTimeout(() => {
            updateTargetLanguages(tgtVal);
            tgt.setValue(srcVal);  // ← ВОЗВРАЩАЕМ target
        }, 150);
    });

    // 5. Форма
    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);

        button.textContent = "⏳ Считаю...";
        button.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/calc`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            resultDiv.innerHTML = `
                <div style="padding:25px;background:linear-gradient(135deg,#10b981,#059669);color:white;border-radius:12px;">
                    <h3>📊 Результат расчёта</h3>
                    <p><strong>Формат:</strong> ${data.format}</p>
                    <p><strong>Символов:</strong> ${data.chars.toLocaleString()}</p>
                    <p><strong>Страниц:</strong> ${data.pages}</p>
                    <p><strong>💰 Цена за страницу:</strong> ${data.price_per_page} BYN</p>
                    <p style="font-size:1.5em;margin:15px 0;"><strong>Итого: ${data.price}</strong></p>
                    ${!data.translator_available ? `
                        <div style="background:rgba(255,255,255,0.2);padding:12px;border-radius:8px;margin-top:15px;font-size:0.9em;border-left:4px solid #fbbf24;">
                            ⚠️ <strong>Внимание:</strong> В настоящий момент переводчик по этой паре может быть недоступен.<br>
                            Свяжитесь с нами для согласования перевода.
                        </div>
                    ` : `
                        <div style="background:rgba(255,255,255,0.2);padding:8px;border-radius:6px;font-size:0.85em;">
                            ✅ Переводчик доступен. Свяжитесь с нами для согласования перевода.
                        </div>
                    `}
                </div>
            `;
        } catch(error) {
            console.error("Ошибка:", error);
            resultDiv.innerHTML = `
                <div style="padding:20px;background:#fee2e2;color:#b91c1c;border-radius:12px;">
                    ❌ Ошибка: ${error.message}
                </div>
            `;
        }

        button.textContent = "🔢 Рассчитать";
        button.disabled = false;
    });

}, 100);
