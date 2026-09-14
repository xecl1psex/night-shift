# QWEN.md — Инструкции для Qwen Code

## Проект
Игра «СМЕНА» — браузерный хоррор на чистом HTML/CSS/JS.
Работает на GitHub Pages. Точка входа — index.html в корне.

## Обязательные правила
1. НЕ использовать внешние библиотеки, картинки, шрифты, аудиофайлы.
2. Все спрайты — через canvas (fillRect, arc, lineTo).
3. Все звуки — через Web Audio API.
4. Все тексты — на русском, шрифт monospace.
5. Координаты — строго из ТЗ.
6. GameState — единственный источник правды.
7. Никаких // TODO и заглушек.
8. Все пути в index.html — относительные.

## Структура проекта
styles/main.css, styles/crt.css
scripts/state.js, save.js, audio.js, cameras.js, anomalies.js,
monster.js, player.js, ui.js, endings.js, main.js
index.html

## Палитра
bgBlack:#0a0a0a, bgDark:#141414, bgMid:#1e1e1e, bgLight:#2a2a2a,
metal:#3a3a3a, metalLight:#5a5a5a, rust:#6b3a1f, wood:#4a3520,
floor:#252525, wall:#1a1a1a,
lamp:#c9a227, lampGlow:rgba(201,162,39,0.15),
crtGreen:#39ff14, crtGreenDim:#1f8a0c,
alarm:#ff2222, alarmDim:#8a0f0f,
shadow:rgba(0,0,0,0.85), white:#e8e8e8, blood:#8b0000

## Порядок подключения скриптов
audio → save → state → cameras → anomalies → monster → player → ui → endings → main

## Порядок разработки
1. index.html + CSS
2. state.js, save.js, audio.js
3. cameras.js
4. anomalies.js
5. monster.js
6. player.js, ui.js, endings.js
7. main.js
8. NIGHT_CONFIG
