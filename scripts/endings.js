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
    if (typeof stopTutorial === 'function') stopTutorial();
    stopHum();
    GameState.humStarted = false;

    const currentNight = GameState.currentNight;
    console.log('[NIGHT] Ночь', currentNight, 'пройдена. Статы:', GameState.stats);

    if (currentNight >= 12) {
        startWinSequence();
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

function startWinSequence() {
    const container = document.getElementById('win-text');
    if (!container) return;
    container.innerHTML = '';
    container.style.opacity = '0';

    const canvas = GameState.dom.jumpscareCanvas;
    const ctxJ = GameState.dom.jumpscareCtx;

    setTimeout(() => {
        if (!canvas || !ctxJ) return;
        canvas.style.display = 'block';
        ctxJ.fillStyle = '#000000';
        ctxJ.fillRect(0, 0, 1280, 720);

        setTimeout(() => {
            ctxJ.fillStyle = 'rgba(255,255,255,0.15)';
            ctxJ.fillRect(0, 0, 1280, 720);

            ctxJ.save();
            ctxJ.translate(640, 360);
            ctxJ.fillStyle = '#0a0a0a';
            ctxJ.beginPath();
            ctxJ.ellipse(0, 0, 180, 260, 0, 0, Math.PI * 2);
            ctxJ.fill();
            ctxJ.fillStyle = '#ffffff';
            ctxJ.beginPath();
            ctxJ.arc(-60, -70, 25, 0, Math.PI * 2);
            ctxJ.arc(60, -70, 25, 0, Math.PI * 2);
            ctxJ.fill();
            ctxJ.restore();

            setTimeout(() => {
                ctxJ.fillStyle = 'rgba(0,0,0,0.85)';
                ctxJ.fillRect(0, 0, 1280, 720);

                setTimeout(() => {
                    canvas.style.display = 'none';
                    container.style.opacity = '1';
                    container.style.transition = 'opacity 2s';

                    const lines = [
                        'Ты дожил до утра.',
                        '',
                        'В серверной ты нашёл журнал смен.',
                        'Все операторы до тебя уволились по собственному желанию.',
                        '',
                        'Последняя запись — твоё имя.',
                        'Дата — завтра.'
                    ];

                    for (let i = 0; i < lines.length; i++) {
                        setTimeout(() => {
                            container.innerHTML += lines[i] + '\n';
                        }, i * 1500);
                    }

                    setTimeout(() => {
                        container.innerHTML += '\n\nКОНЕЦ';
                        if (typeof playStatic === 'function') playStatic(1.0);
                    }, lines.length * 1500 + 800);

                    setTimeout(() => {
                        resetGame();
                        setMode('MENU');
                        initMenu();
                    }, lines.length * 1500 + 5000);
                }, 800);
            }, 1200);
        }, 1500);
    }, 500);
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
    if (typeof startTutorial === 'function') startTutorial();
}

window.showEnding = showEnding;
window.nightComplete = nightComplete;
window.startNightReal = startNightReal;
window.startWinSequence = startWinSequence;
window.endNight = endNight;
