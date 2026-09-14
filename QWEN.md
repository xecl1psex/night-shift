# QWEN.md — Инструкции для Qwen Code

## Проект
Игра «СМЕНА» — браузерный хоррор на чистом HTML/CSS/JS.
Работает на GitHub Pages. Точка входа — index.html в корне.

## Обязательные правила
1. НЕ использовать внешние библиотеки, картинки, шрифты, аудиофайлы.
2. Все спрайты — через canvas (fillRect, arc, lineTo).
3. Все звуки — через Web Audio API (осцилляторы + шум).
4. Все тексты — на русском, шрифт monospace.
5. Координаты — строго из ТЗ, не менять и не округлять.
6. GameState — единственный источник правды (глобальный объект).
7. Никаких // TODO, заглушек, alert('здесь будет X').
8. Все пути в index.html — относительные (без ведущего слэша).

## Структура проекта
/styles/main.css, /styles/crt.css
/scripts/state.js — глобальное состояние
/scripts/save.js — localStorage
/scripts/audio.js — Web Audio API
/scripts/cameras.js — отрисовка 4 комнат
/scripts/anomalies.js — 7 типов аномалий
/scripts/monster.js — ИИ монстра
/scripts/player.js — энергия, двери, свет
/scripts/ui.js — меню, HUD, обработчики
/scripts/endings.js — концовки, jumpscare
/scripts/main.js — игровой цикл, рендер, ввод
/index.html — точка входа

## Палитра (использовать везде)
bgBlack:#0a0a0a, bgDark:#141414, bgMid:#1e1e1e, bgLight:#2a2a2a,
metal:#3a3a3a, metalLight:#5a5a5a, rust:#6b3a1f, wood:#4a3520,
floor:#252525, wall:#1a1a1a,
lamp:#c9a227, lampGlow:rgba(201,162,39,0.15),
crtGreen:#39ff14, crtGreenDim:#1f8a0c,
alarm:#ff2222, alarmDim:#8a0f0f,
shadow:rgba(0,0,0,0.85), white:#e8e8e8, blood:#8b0000

## Порядок подключения скриптов в index.html
audio.js → save.js → state.js → cameras.js → anomalies.js →
monster.js → player.js → ui.js → endings.js → main.js

## Порядок разработки (коммит после каждого шага)
1. index.html + CSS (каркас)
2. state.js, save.js, audio.js
3. cameras.js (4 комнаты)
4. anomalies.js (7 функций)
5. monster.js (автомат + отрисовка)
6. player.js, ui.js, endings.js
7. main.js (сборка)
8. NIGHT_CONFIG (баланс)

## Стиль
Плоский, пиксельный, без градиентов (кроме явно указанных).
CRT-эффекты: сканлайны, виньетка, зерно, RGB-сдвиг при тревоге.
