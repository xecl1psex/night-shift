# QWEN.md — Инструкции для Qwen Code

## Проект
Игра «СМЕНА» — браузерный хоррор на чистом HTML/CSS/JS.
Репозиторий: xec1psex/night-shift
GitHub Pages: https://xec1psex.github.io/night-shift/

## Абсолютные правила
1. НЕ использовать внешние библиотеки, картинки, шрифты, аудиофайлы.
2. Все спрайты — через canvas (fillRect, arc, lineTo).
3. Все звуки — через Web Audio API.
4. Все тексты — на русском, monospace.
5. Координаты — строго из ТЗ, не менять.
6. GameState — единственный источник правды.
7. Никаких // TODO и заглушек. Всё сразу рабочее.
8. Все пути к файлам — относительные (без ведущего /).
9. Регистр имён файлов — строго как в ТЗ.

## Структура проекта
/index.html
/styles/main.css
/styles/crt.css
/scripts/state.js
/scripts/save.js
/scripts/audio.js
/scripts/cameras.js
/scripts/anomalies.js
/scripts/monster.js
/scripts/player.js
/scripts/ui.js
/scripts/endings.js
/scripts/main.js

Порядок подключения в index.html:
audio.js → save.js → state.js → cameras.js → anomalies.js → monster.js → player.js → ui.js → endings.js → main.js

## Палитра
bgBlack:#0a0a0a, bgDark:#141414, bgMid:#1e1e1e, bgLight:#2a2a2a,
metal:#3a3a3a, metalLight:#5a5a5a, wood:#4a3520, floor:#252525, wall:#1a1a1a,
lamp:#c9a227, crtGreen:#39ff14, alarm:#ff2222, alarmDim:#8a0f0f,
white:#e8e8e8, blood:#8b0000

## Порядок сборки
1. index.html + styles/main.css + styles/crt.css
2. state.js, save.js, audio.js
3. cameras.js (общие + 4 комнаты)
4. anomalies.js (7 функций + спавн)
5. monster.js (автомат + отрисовка)
6. player.js, ui.js, endings.js
7. main.js
8. NIGHT_CONFIG в state.js
9. Тест-план

## Формат работы
- Один файл — один коммит.
- После каждого файла — проверка синтаксиса.
- Если неясно — задать вопрос, не додумывать.
