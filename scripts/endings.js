// ============================================
// scripts/endings.js — Концовки, jumpscare, победа
// ============================================

function startNight(n) {
    GameState.currentNight = n;
    resetNightState();
    GameState.player = createPlayer();
    GameState.monster = createMonster();
    GameState.anomalies = [];
    showIntroText(n);
}

function startNightReal() {
    setMode('PLAYING');
    if (typeof startTick === 'function') startTick();
    if (typeof startHum === 'function' && !GameState.humStarted) {
        startHum();
        GameState.humStarted = true;
    }
}

function endNight(won) {
    if (typeof stopTick === 'function') stopTick();
    if (typeof stopHum === 'function') stopHum();
    GameState.humStarted = false;

    const stats = {
        fixed: GameState.stats.fixed,
        missed: GameState.stats.missed
    };

    if (won) {
        const nightEl = document.getElementById('complete-night');
        const fixedEl = document.getElementById('complete-fixed');
        const missedEl = document.getElementById('complete-missed');
        const energyEl = document.getElementById('complete-energy');
        if (nightEl) nightEl.textContent = GameState.currentNight;
        if (fixedEl) fixedEl.textContent = stats.fixed;
        if (missedEl) missedEl.textContent = stats.missed;
        if (energyEl && GameState.player) {
            energyEl.textContent = Math.floor(GameState.player.energy);
        }

        if (GameState.currentNight < 12) {
            saveProgress(GameState.currentNight + 1, stats);
        }

        if (GameState.currentNight >= 12) {
            setMode('WIN');
            startWinSequence();
        } else {
            setMode('NIGHT_COMPLETE');
        }
    } else {
        registerDeath();
        const fixedEl = document.getElementById('stat-fixed');
        const missedEl = document.getElementById('stat-missed');
        if (fixedEl) fixedEl.textContent = stats.fixed;
        if (missedEl) missedEl.textContent = stats.missed;
        setMode('GAMEOVER');
    }
}

function triggerJumpscare() {
    setMode('JUMPSCARE');
    if (typeof stopTick === 'function') stopTick();
    if (typeof playScream === 'function') playScream();
    startJumpscareRender();
    setTimeout(() => {
        endNight(false);
    }, 1500);
}

function startJumpscareRender() {
    const canvas = GameState.dom.jumpscareCanvas;
    if (!canvas) return;
    const ctxJ = GameState.dom.jumpscareCtx;
    if (!ctxJ) return;

    canvas.style.display = 'block';
    const startTime = performance.now();

    function frame() {
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed > 1.5) {
            canvas.style.display = 'none';
            return;
        }

        ctxJ.fillStyle = '#ff0000';
        ctxJ.fillRect(0, 0, 1280, 720);

        const shakeX = (Math.random() - 0.5) * 20;
        const shakeY = (Math.random() - 0.5) * 20;

        ctxJ.save();
        ctxJ.translate(640 + shakeX, 360 + shakeY);

        ctxJ.fillStyle = '#0a0a0a';
        ctxJ.beginPath();
        ctxJ.ellipse(0, 0, 200, 280, 0, 0, Math.PI * 2);
        ctxJ.fill();

        ctxJ.fillStyle = '#ffffff';
        ctxJ.beginPath();
        ctxJ.arc(-70, -80, 30, 0, Math.PI * 2);
        ctxJ.arc(70, -80, 30, 0, Math.PI * 2);
        ctxJ.fill();

        ctxJ.fillStyle = '#ff0000';
        ctxJ.beginPath();
        ctxJ.arc(-70, -80, 12, 0, Math.PI * 2);
        ctxJ.arc(70, -80, 12, 0, Math.PI * 2);
        ctxJ.fill();

        ctxJ.fillStyle = '#000000';
        ctxJ.beginPath();
        ctxJ.ellipse(0, 100, 120, 80, 0, 0, Math.PI * 2);
        ctxJ.fill();

        ctxJ.fillStyle = '#ffffff';
        for (let i = 0; i < 8; i++) {
            const x = -100 + i * 28;
            ctxJ.fillRect(x, 30, 20, 30);
            ctxJ.fillRect(x, 140, 20, 30);
        }

        ctxJ.restore();

        ctxJ.fillStyle = 'rgba(255,0,0,0.3)';
        ctxJ.fillRect(0, 0, 1280, 720);

        requestAnimationFrame(frame);
    }

    frame();
}

function startWinSequence() {
    const lines = [
        'Ты дожил до утра.',
        '',
        'В серверной ты нашёл журнал смен.',
        'Все операторы до тебя уволились по собственному желанию.',
        '',
        'Последняя запись — твоё имя.',
        'Дата — завтра.'
    ];

    const container = document.getElementById('win-text');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < lines.length; i++) {
        setTimeout(() => {
            container.innerHTML += lines[i] + '\n';
        }, i * 2000);
    }

    setTimeout(() => {
        container.innerHTML += '\n\nКОНЕЦ';
        if (typeof playStatic === 'function') playStatic(1.0);
    }, lines.length * 2000 + 1000);

    setTimeout(() => {
        resetGame();
        setMode('MENU');
        initMenu();
    }, lines.length * 2000 + 5000);
}

window.startNight = startNight;
window.startNightReal = startNightReal;
window.endNight = endNight;
window.triggerJumpscare = triggerJumpscare;
window.startJumpscareRender = startJumpscareRender;
window.startWinSequence = startWinSequence;
