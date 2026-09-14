// ============================================
// scripts/main.js — Игровой цикл, рендер, ввод
// ============================================

let lastFrameTime = 0;

function init() {
    GameState.dom.canvasActive = document.getElementById('active-cam');
    if (GameState.dom.canvasActive) {
        GameState.dom.ctxActive = GameState.dom.canvasActive.getContext('2d');
    }

    GameState.dom.miniCams = [
        { id: 'CAM1', canvas: document.getElementById('mini-1') },
        { id: 'CAM2', canvas: document.getElementById('mini-2') },
        { id: 'CAM3', canvas: document.getElementById('mini-3') },
        { id: 'CAM4', canvas: document.getElementById('mini-4') }
    ];
    GameState.dom.miniCams.forEach(m => {
        if (m.canvas) m.ctx = m.canvas.getContext('2d');
    });

    GameState.dom.jumpscareCanvas = document.getElementById('jumpscare-canvas');
    if (GameState.dom.jumpscareCanvas) {
        GameState.dom.jumpscareCtx = GameState.dom.jumpscareCanvas.getContext('2d');
    }

    GameState.player = createPlayer();
    GameState.monster = createMonster();
    GameState.anomalies = [];

    document.addEventListener('keydown', handleKeyDown);
    if (GameState.dom.canvasActive) {
        GameState.dom.canvasActive.addEventListener('click', handleCanvasClick);
    }

    GameState.dom.miniCams.forEach(m => {
        if (m.canvas) {
            m.canvas.addEventListener('click', () => selectCamera(m.id));
        }
    });

    const btnL = document.getElementById('btn-door-left');
    if (btnL) btnL.addEventListener('click', toggleDoorLeft);
    const btnR = document.getElementById('btn-door-right');
    if (btnR) btnR.addEventListener('click', toggleDoorRight);
    const btnLight = document.getElementById('btn-light');
    if (btnLight) btnLight.addEventListener('click', toggleLight);

    document.addEventListener('click', () => {
        if (!audioCtx) initAudio();
    }, { once: true });

    bindMenuButtons();

    setMode('BOOT');
    runBootSequence();

    resize();
    window.addEventListener('resize', resize);

    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resize() {
    const game = document.getElementById('game');
    if (!game) return;
    const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    game.style.transform = 'scale(' + scale + ')';
}

function runBootSequence() {
    const lines = [
        '> ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ...',
        '> ЗАГРУЗКА МОДУЛЕЙ... OK',
        '> ПРОВЕРКА КАМЕР... 4/4',
        '> СВЯЗЬ С ОПЕРАТОРОМ... УСТАНОВЛЕНА',
        '> СМЕНА НАЧИНАЕТСЯ'
    ];
    const container = document.getElementById('boot-text');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < lines.length; i++) {
        setTimeout(() => {
            container.innerHTML += lines[i] + '<br>';
            if (typeof playClick === 'function') playClick();
        }, i * 400);
    }

    setTimeout(() => {
        setMode('MENU');
    }, lines.length * 400 + 1000);
}

function handleKeyDown(e) {
    if (GameState.mode !== 'PLAYING') return;

    if (e.key === '1') selectCamera('CAM1');
    else if (e.key === '2') selectCamera('CAM2');
    else if (e.key === '3') selectCamera('CAM3');
    else if (e.key === '4') selectCamera('CAM4');
    else if (e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') toggleDoorLeft();
    else if (e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') toggleDoorRight();
    else if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') toggleLight();
    else if (e.key === 'Escape') pauseGame();
}

function handleCanvasClick(e) {
    if (GameState.mode !== 'PLAYING') return;
    const canvas = GameState.dom.canvasActive;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (640 / rect.width);
    const y = (e.clientY - rect.top) * (480 / rect.height);

    const player = GameState.player;
    const monster = GameState.monster;
    if (!player || !monster) return;

    let hit = false;
    for (let i = GameState.anomalies.length - 1; i >= 0; i--) {
        const a = GameState.anomalies[i];
        if (a.camera !== player.currentCam) continue;

        const dist = Math.hypot(x - a.x, y - a.y);
        if (dist >= a.hitRadius) continue;

        if (a.isFalse) {
            monster.progress += 5;
            player.energy -= 8;
            if (typeof registerFalseClick === 'function') registerFalseClick();
            if (typeof playWhisper === 'function') playWhisper();
            flashScreen('red');
        } else {
            GameState.anomalies.splice(i, 1);
            monster.progress -= 2;
            if (monster.progress < 0) monster.progress = 0;
            if (typeof registerAnomalyFixed === 'function') registerAnomalyFixed();
            if (typeof playClick === 'function') playClick();
            flashScreen('green');
        }
        hit = true;
        break;
    }

    if (!hit) {
        monster.progress += 3;
        player.energy -= 5;
        if (typeof playWhisper === 'function') playWhisper();
        flashScreen('red');
    }
}

function flashScreen(color) {
    const game = document.getElementById('game');
    if (!game) return;
    const cls = color === 'red' ? 'flash-red' : 'flash-green';
    game.classList.add(cls);
    setTimeout(() => game.classList.remove(cls), 150);
}

function updateGameTime() {
    GameState.gameHour = Math.floor(GameState.elapsedTime / 60);
    GameState.gameMinute = Math.floor(GameState.elapsedTime % 60);
    if (GameState.gameHour >= 6) {
        endNight(true);
    }
}

function startTick() {
    if (GameState.tickInterval) clearInterval(GameState.tickInterval);
    GameState.tickInterval = setInterval(() => {
        if (GameState.mode !== 'PLAYING') return;
        monsterTick(1.0);
        spawnAnomalyIfNeeded();
    }, 1000);

    if (GameState.staticInterval) clearInterval(GameState.staticInterval);
    GameState.staticInterval = setInterval(() => {
        if (GameState.mode !== 'PLAYING') return;
        const intensity = GameState.monster ? GameState.monster.progress / 100 : 0;
        playStatic(intensity);
    }, 200);
}

function stopTick() {
    if (GameState.tickInterval) {
        clearInterval(GameState.tickInterval);
        GameState.tickInterval = null;
    }
    if (GameState.staticInterval) {
        clearInterval(GameState.staticInterval);
        GameState.staticInterval = null;
    }
}

function gameLoop(now) {
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (GameState.mode === 'PLAYING') {
        GameState.elapsedTime += dt;
        updateGameTime();
        updateEnergy(dt);
        updateAnomalies(dt);
        GameState.scanY += 2;
        if (GameState.scanY > 480) GameState.scanY = -20;
    }

    render();
    requestAnimationFrame(gameLoop);
}

function render() {
    if (GameState.mode !== 'PLAYING' && GameState.mode !== 'PAUSED') return;

    if (GameState.dom.ctxActive) {
        renderActiveCamera(GameState.dom.ctxActive);
    }

    GameState.dom.miniCams.forEach(m => {
        if (m.ctx) renderMiniCam(m.ctx, m.id);
    });

    updateHUD();
    updateEnergyBar();
    updateButtonIndicators();
    updateDoorButtons();
    updateLowEnergyEffects();

    if (GameState.monster && GameState.monster.state === 'DOOR' && GameState.dom.ctxActive) {
        drawMonsterDoor(GameState.dom.ctxActive, GameState.monster.side === 'BOTH' ? 'LEFT' : GameState.monster.side);
    }
}

function renderActiveCamera(ctx) {
    const id = GameState.player ? GameState.player.currentCam : 'CAM1';

    if (id === 'CAM1') drawRoomCAM1(ctx);
    else if (id === 'CAM2') drawRoomCAM2(ctx);
    else if (id === 'CAM3') drawRoomCAM3(ctx);
    else if (id === 'CAM4') drawRoomCAM4(ctx);

    for (const a of GameState.anomalies) {
        if (a.camera !== id) continue;
        if (a.isFalse) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            a.draw(ctx, a.x, a.y, GameState.elapsedTime);
            ctx.restore();
        } else {
            a.draw(ctx, a.x, a.y, GameState.elapsedTime);
        }
    }

    const m = GameState.monster;
    if (m && m.position === id && m.state !== 'HIDDEN') {
        const scale = m.state === 'WANDER' ? 0.6 : 1.0;
        drawMonster(ctx, 320, 280, m.state, scale);
    }

    drawNoise(ctx, 640, 480, 300);
    drawScanLine(ctx, 640, 480, GameState.scanY);
    drawREC(ctx);
}

function renderMiniCam(ctx, camId) {
    const W = 200;
    const H = 120;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.scale(W / 640, H / 480);

    if (camId === 'CAM1') drawRoomCAM1(ctx);
    else if (camId === 'CAM2') drawRoomCAM2(ctx);
    else if (camId === 'CAM3') drawRoomCAM3(ctx);
    else if (camId === 'CAM4') drawRoomCAM4(ctx);

    for (const a of GameState.anomalies) {
        if (a.camera !== camId) continue;
        if (a.isFalse) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            a.draw(ctx, a.x, a.y, GameState.elapsedTime);
            ctx.restore();
        } else {
            a.draw(ctx, a.x, a.y, GameState.elapsedTime);
        }
    }

    const m = GameState.monster;
    if (m && m.position === camId && m.state !== 'HIDDEN') {
        const scale = m.state === 'WANDER' ? 0.6 : 1.0;
        drawMonster(ctx, 320, 280, m.state, scale);
    }

    drawNoise(ctx, 640, 480, 80);
    ctx.restore();

    if (Math.floor(GameState.elapsedTime * 2) % 2 === 0) {
        ctx.fillStyle = '#ff2222';
        ctx.beginPath();
        ctx.arc(12, 12, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    if (GameState.anomalies.some(a => a.camera === camId)) {
        ctx.fillStyle = '#c9a227';
        ctx.beginPath();
        ctx.moveTo(188, 8);
        ctx.lineTo(196, 22);
        ctx.lineTo(180, 22);
        ctx.closePath();
        ctx.fill();
    }

    if (GameState.monster && GameState.monster.position === camId && GameState.monster.state !== 'HIDDEN') {
        ctx.fillStyle = '#8a0f0f';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('◉', 194, 116);
    }
}

function drawNoise(ctx, w, h, count) {
    for (let i = 0; i < count; i++) {
        ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.06) + ')';
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
}

function drawScanLine(ctx, w, h, y) {
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, y, w, 20);
}

function drawREC(ctx) {
    if (Math.floor(GameState.elapsedTime * 2) % 2 === 0) {
        ctx.fillStyle = '#ff2222';
        ctx.beginPath();
        ctx.arc(20, 20, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#ff2222';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('REC', 32, 24);
}

window.init = init;
window.gameLoop = gameLoop;
window.render = render;
window.renderActiveCamera = renderActiveCamera;
window.renderMiniCam = renderMiniCam;
window.drawNoise = drawNoise;
window.drawScanLine = drawScanLine;
window.drawREC = drawREC;
window.handleKeyDown = handleKeyDown;
window.handleCanvasClick = handleCanvasClick;
window.flashScreen = flashScreen;
window.startTick = startTick;
window.stopTick = stopTick;
window.updateGameTime = updateGameTime;

document.addEventListener('DOMContentLoaded', init);
