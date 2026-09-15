// ============================================
// scripts/endings.js — Концовки и переходы между ночами
// ============================================
// Я есть: Система endings (концовок) в игре "СМЕНА". Управляет
// двумя основными исходами: гибель от монстра (death) и
// успешное завершение ночи (win). Отображает экран завершения
// ночи со статистикой (починено аномалий, пропущено, остаток
// энергии). После 12-й ночи показывает финальный экран победы.
// Координирует переход к следующей ночи через startNightReal(),
// который сбрасывает состояние ночи, создаёт нового игрока
// и монстра, запускает игровые таймеры и звук.
// ============================================

function showEnding(type) {
    const screen = document.getElementById('screen-gameover');
    if (!screen) return;

    const title = document.getElementById('ending-title');
    const desc = document.getElementById('ending-desc');
    const btn = document.getElementById('btn-menu-from-ending');

    if (type === 'death') {
        if (title) title.textContent = 'ВЫ ПОГИБЛИ';
        if (desc) desc.textContent = 'Монстр добрался до вас. Следующая ночь будет сложнее.';
        if (btn) btn.textContent = 'Продолжить';
    } else if (type === 'win') {
        if (title) title.textContent = 'ВЫ ВЫЖИЛИ!';
        if (desc) desc.textContent = 'Смена окончена. Вы получили выплату и остались живы.';
        if (btn) btn.textContent = 'В меню';
    }

    setMode('GAMEOVER');
}

function nightComplete() {
    stopHum();
    GameState.humStarted = false;

    const currentNight = GameState.currentNight;
    if (currentNight >= 12) {
        showEnding('win');
        return;
    }

    const screen = document.getElementById('screen-night-complete');
    if (!screen) return;

    const nightNum = document.getElementById('complete-night');
    if (nightNum) nightNum.textContent = currentNight;

    const fixedEl = document.getElementById('complete-fixed');
    if (fixedEl) fixedEl.textContent = GameState.stats.fixed;

    const missedEl = document.getElementById('complete-missed');
    if (missedEl) missedEl.textContent = GameState.stats.missed;

    const energyEl = document.getElementById('complete-energy');
    if (energyEl && GameState.player) energyEl.textContent = Math.floor(GameState.player.energy);

    setMode('NIGHT_COMPLETE');
}

function startNightReal() {
    resetNightState();
    GameState.player = createPlayer();
    GameState.monster = createMonster();
    GameState.anomalies = [];
    GameState.lastAnomalySpawnTime = 0;
    setMode('PLAYING');
    if (typeof startTick === 'function') startTick();
    if (typeof startHum === 'function' && !GameState.humStarted) {
        startHum();
        GameState.humStarted = true;
    }
}

window.showEnding = showEnding;
window.nightComplete = nightComplete;
window.startNightReal = startNightReal;
