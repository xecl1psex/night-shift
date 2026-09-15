// ============================================
// scripts/endings.js — Концовки и переходы между ночами
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

    const nightNum = document.getElementById('night-complete-number');
    if (nightNum) nightNum.textContent = currentNight;

    setMode('NIGHT_COMPLETE');

    setTimeout(() => {
        startNightReal();
    }, 3000);
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
