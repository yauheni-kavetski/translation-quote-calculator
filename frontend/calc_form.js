document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("calcForm");
    const resultDiv = document.getElementById("result");
    if (!form) return;

    const allLanguages = {
        ru:{text:"Русский",flag:"🇷🇺"}, be:{text:"Белорусский",flag:"🇧🇾"}, en:{text:"Английский",flag:"🇬🇧"},
        pl:{text:"Польский",flag:"🇵🇱"}, de:{text:"Немецкий",flag:"🇩🇪"}, es:{text:"Испанский",flag:"🇪🇸"},
        fr:{text:"Французский",flag:"🇫🇷"}, it:{text:"Итальянский",flag:"🇮🇹"}, pt:{text:"Португальский",flag:"🇵🇹"},
        az:{text:"Азербайджанский",flag:"🇦🇿"}, ar:{text:"Арабский",flag:"🇸🇦"}, hy:{text:"Армянский",flag:"🇦🇲"},
        hu:{text:"Венгерский",flag:"🇭🇺"}, nl:{text:"Нидерландский",flag:"🇳🇱"}, ka:{text:"Грузинский",flag:"🇬🇪"},
        da:{text:"Датский",flag:"🇩🇰"}, zh:{text:"Китайский",flag:"🇨🇳"}, ko:{text:"Корейский",flag:"🇰🇷"},
        lv:{text:"Латышский",flag:"🇱🇻"}, lt:{text:"Литовский",flag:"🇱🇹"}, mk:{text:"Македонский",flag:"🇲🇰"},
        md:{text:"Молдавский",flag:"🇲🇩"}, no:{text:"Норвежский",flag:"🇳🇴"}, ro:{text:"Румынский",flag:"🇷🇴"},
        sr:{text:"Сербский",flag:"🇷🇸"}, sk:{text:"Словацкий",flag:"🇸🇰"}, sl:{text:"Словенский",flag:"🇸🇮"},
        tg:{text:"Таджикский",flag:"🇹🇯"}, tr:{text:"Турецкий",flag:"🇹🇷"}, uz:{text:"Узбекский",flag:"🇺🇿"},
        uk:{text:"Украинский",flag:"🇺🇦"}, fi:{text:"Финский",flag:"🇫🇮"}, hr:{text:"Хорватский",flag:"🇭🇷"},
        cs:{text:"Чешский",flag:"🇨🇿"}, sv:{text:"Шведский",flag:"🇸🇪"}, et:{text:"Эстонский",flag:"🇪🇪"},
        ja:{text:"Японский",flag:"🇯🇵"}, kk:{text:"Казахский",flag:"🇰🇿"}
    };

    function renderLang(data, escape){
        if(!data.value) return `<div>${escape(data.text)}</div>`;
        const lang = allLanguages[data.value];
        return `<div>${lang.flag} ${escape(lang.text)}</div>`;
    }

    const src = new TomSelect("#src_lang",{ render:{option:renderLang,item:renderLang} });
    const tgt = new TomSelect("#tgt_lang",{ render:{option:renderLang,item:renderLang} });

    // --- уведомление под target ---
    const tgtNotice = document.createElement("div");
    tgtNotice.style.color = "#b91c1c";
    tgtNotice.style.fontSize = "0.9em";
    tgtNotice.style.marginTop = "5px";
    tgtNotice.textContent = "Сначала выберите язык оригинала";
    form.querySelector("#tgt_lang").parentNode.appendChild(tgtNotice);

    // --- блокируем target пока source не выбран ---
    if(!src.getValue()) {
        tgt.disable();
        tgtNotice.style.display = "block";
    }

    function preventSameLanguages(){
        if(src.getValue() && src.getValue() === tgt.getValue()){
            tgt.clear();
        }
    }

    let controller = null;

    async function updateTargetLanguages(srcLang){

        let options=[{value:"",text:"Выберите язык"}];

        if(!srcLang){
            Object.keys(allLanguages).forEach(code=>{
                options.push({value:code,text:allLanguages[code].text});
            });
        } else {
            try {
                if(controller) controller.abort();
                controller = new AbortController();

                const response = await fetch(`https://api.bug-lingvo.by/available-pairs/${srcLang}`,{
                    signal: controller.signal
                });

                if(!response.ok) throw new Error("API error");

                const data = await response.json();

                data.available.forEach(item=>{
                    const code=item.lang;
                    if(allLanguages[code]){
                        options.push({value:code,text:allLanguages[code].text});
                    }
                });

            } catch(e) {
                if(e.name !== "AbortError"){
                    console.error("API error:",e);
                    Object.keys(allLanguages).forEach(code=>{
                        options.push({value:code,text:allLanguages[code].text});
                    });
                }
            }
        }

        tgt.clearOptions();
        tgt.addOptions(options);
        tgt.refreshOptions(false);
        preventSameLanguages();
    }

    // 🔹 Подгружаем target сразу после инициализации
    updateTargetLanguages(src.getValue());

    // --- обработчики ---
    src.on("change",()=>{
        // разблокируем target и скрываем уведомление
        if(src.getValue()){
            tgt.enable();
            tgtNotice.style.display = "none";
        } else {
            tgt.disable();
            tgtNotice.style.display = "block";
        }
        updateTargetLanguages(src.getValue());
    });

    tgt.on("change", preventSameLanguages);

    document.getElementById("swapLangs")?.addEventListener("click", async ()=>{
        const srcVal = src.getValue();
        const tgtVal = tgt.getValue();

        if(!srcVal || !tgtVal) return;

        src.setValue(tgtVal);
        await updateTargetLanguages(tgtVal);
        tgt.setValue(srcVal);
    });

    form.addEventListener("submit", async (e)=>{
        e.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);

        button.textContent = "⏳ Считаю...";
        button.disabled = true;

        try {
            const response = await fetch("https://api.bug-lingvo.by/calc",{ method:"POST", body:formData });
            if(!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            resultDiv.innerHTML = `
            <div style="padding:25px;background:linear-gradient(135deg,#10b981,#059669);color:white;border-radius:12px;">
            <h3>📊 Результат расчёта</h3>
            <p><strong>Формат:</strong> ${data.format}</p>
            <p><strong>Символов:</strong> ${data.chars.toLocaleString()}</p>
            <p><strong>Страниц:</strong> ${data.pages}</p>
            <p><strong>💰 Цена за страницу:</strong> ${data.price_per_page} BYN</p>
            <p style="font-size:1.5em;margin:15px 0;"><strong>Итого: ${data.price}</strong></p>

            ${
            !data.translator_available
            ? `<div style="background:rgba(255,255,255,0.2);padding:12px;border-radius:8px;margin-top:15px;font-size:0.9em;border-left:4px solid #fbbf24;">
            ⚠️ Переводчик может быть недоступен. Свяжитесь с нами.
            </div>`
            : `<div style="background:rgba(255,255,255,0.2);padding:8px;border-radius:6px;font-size:0.85em;">
            ✅ Переводчик доступен
            </div>`
            }

            </div>`;
        } catch(error) {
            resultDiv.innerHTML = `
            <div style="padding:20px;background:#fee2e2;color:#b91c1c;border-radius:12px;">
            ❌ Ошибка: ${error.message}
            </div>`;
        }

        button.textContent = "🔢 Рассчитать";
        button.disabled = false;
    });

});