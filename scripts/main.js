// ============================================
// scripts/main.js — Игровой цикл, рендер, ввод
// ============================================
// Я есть: Главный модуль игры "СМЕНА". Управляет циклом отрисовки,
// обработкой ввода пользователя (клавиатура, мышь), инициализацией
// Canvas-контекстов и запуском игровых систем. Координирует работу
// всех остальных модулей через глобальный объект GameState.
// ============================================

let lastFrameTime = 0; // Время последнего кадра для расчёта delta time
let lastMissClickTime = 0; // Время последнего промаха по аномалии

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
        // Start ambient music on first click if audio context exists
        if (audioCtx && typeof window.startAmbient === 'function' && !window.ambientOsc1) {
            window.startAmbient();
        }
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
        const now = window.getAudioContextTime ? window.getAudioContextTime() : 0;
        if (now - lastMissClickTime < 0.3) return;
        lastMissClickTime = now;
        
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
    const cfg = getNightConfig(GameState.currentNight);
    const hourDuration = cfg.nightDuration / 6;
    const elapsedHours = Math.floor(GameState.elapsedTime / hourDuration);
    GameState.gameHour = Math.min(6, elapsedHours);
    if (elapsedHours >= 6) {
        GameState.gameMinute = 0;
    } else {
        GameState.gameMinute = Math.floor((GameState.elapsedTime % hourDuration) / hourDuration * 60);
    }
    if (GameState.elapsedTime >= cfg.nightDuration) {
        endNight(true);
    }
}

function endNight(success) {
    if (success) {
        // Остановить игровые таймеры перед показом экрана завершения
        stopTick();
        nightComplete();
    }
}

function triggerJumpscare() {
    const m = GameState.monster;
    if (!m) return;
    
    // Остановить таймеры игры
    stopTick();
    
    // Установить режим JUMPSCARE
    setMode('JUMPSCARE');
    
    // Нарисовать скример через небольшую задержку
    const canvas = GameState.dom.jumpscareCanvas;
    const ctx = GameState.dom.jumpscareCtx;
    if (!canvas || !ctx) return;
    
    canvas.style.display = 'block';
    
    // Звук скримера
    if (typeof playScream === 'function') playScream();
    
    // Моргание перед скримером
    let flashCount = 0;
    const flashInterval = setInterval(() => {
        flashCount++;
        if (flashCount % 2 === 0) {
            ctx.fillStyle = '#000';
        } else {
            ctx.fillStyle = '#fff';
        }
        ctx.fillRect(0, 0, 1280, 720);
        
        if (flashCount >= 6) {
            clearInterval(flashInterval);
            // Показать лицо монстра
            showJumpscareFace(ctx);
            
            // Через 2 секунды показать экран смерти
            setTimeout(() => {
                canvas.style.display = 'none';
                showEnding('death');
            }, 2000);
        }
    }, 150);
}

function showJumpscareFace(ctx) {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 1280, 720);
    
    ctx.save();
    ctx.translate(640, 360);
    
    // Голова монстра
    ctx.fillStyle = '#0f0f0f';
    ctx.beginPath();
    ctx.ellipse(0, 0, 200, 280, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Глаза (красные, светящиеся)
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(-70, -80, 35, 0, Math.PI * 2);
    ctx.arc(70, -80, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // Зрачки
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(-70, -80, 12, 0, Math.PI * 2);
    ctx.arc(70, -80, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Рот с зубами
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(0, 100, 120, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Зубы
    ctx.fillStyle = '#e8e8e8';
    for (let i = -5; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 25 - 12, 80);
        ctx.lineTo(i * 25, 140);
        ctx.lineTo(i * 25 + 12, 80);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

function startJumpscareRender() {
    // Функция вызывается из onModeChange при переходе в режим JUMPSCARE
    // Сама отрисовка происходит в triggerJumpscare()
}

function startTick() {
    if (GameState.tickInterval) clearInterval(GameState.tickInterval);
    GameState.tickInterval = setInterval(() => {
        if (GameState.mode !== 'PLAYING') return;
        monsterTick(1.0);
        spawnAnomalyIfNeeded();
    }, 1000);

    // Звук статического шума отключён для предотвращения багов
    if (GameState.staticInterval) clearInterval(GameState.staticInterval);
    GameState.staticInterval = null;
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
        // Если режим изменился (например, ночь завершена), не обновляем остальное
        if (GameState.mode === 'PLAYING') {
            updateEnergy(dt);
            updateAnomalies(dt);
            GameState.scanY += 2;
            if (GameState.scanY > 480) GameState.scanY = -20;
        }
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

    if (GameState.player && GameState.player.lightFlashTimer > 0) {
        renderLightFlash(GameState.dom.ctxActive);
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
window.triggerJumpscare = triggerJumpscare;
window.showJumpscareFace = showJumpscareFace;
window.startJumpscareRender = startJumpscareRender;

// Туториал для первой ночи
let tutorialTimeouts = [];

function startTutorial() {
    if (GameState.currentNight !== 1) return;

    const overlay = document.getElementById('tutorial-overlay');
    const text = document.getElementById('tutorial-text');
    if (!overlay || !text) return;

    const steps = [
        { delay: 3000,  duration: 4000, text: 'Ты — оператор камер.\nКлик по мини-экрану справа — переключить камеру.' },
        { delay: 9000,  duration: 5000, text: 'На камерах появляются аномалии.\nЭто тени, стулья не на месте, надписи.\nКлик по аномалии — зафиксировать.' },
        { delay: 16000, duration: 5000, text: 'Если долго не фиксировать — монстр приблизится.\nСтук в дверь — закрой её клавишами A (левая) или D (правая).' },
        { delay: 23000, duration: 5000, text: 'Дожить до 06:00 — ночь пройдена.\nУдачи.' }
    ];

    tutorialTimeouts.forEach(t => clearTimeout(t));
    tutorialTimeouts = [];

    for (const step of steps) {
        const t1 = setTimeout(() => {
            text.innerText = step.text;
            overlay.classList.add('show');
        }, step.delay);

        const t2 = setTimeout(() => {
            overlay.classList.remove('show');
        }, step.delay + step.duration);

        tutorialTimeouts.push(t1, t2);
    }
}

function stopTutorial() {
    tutorialTimeouts.forEach(t => clearTimeout(t));
    tutorialTimeouts = [];
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.classList.remove('show');
}

window.startTutorial = startTutorial;
window.stopTutorial = stopTutorial;

function renderLightFlash(ctx) {
    if (!ctx) return;
    const m = GameState.monster;
    if (!m) return;

    // Общее яркое затемнение — свет "включён"
    ctx.fillStyle = 'rgba(255, 248, 220, 0.08)';
    ctx.fillRect(0, 0, 640, 480);

    // Если монстр у двери — рисуем его силуэт
    if (m.state === 'DOOR') {
        const side = m.side === 'BOTH' ? 'LEFT' : m.side;
        const x = side === 'LEFT' ? 120 : 520;

        // Тёмный силуэт с подсветкой
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 40, 180, 80, 240);

        // Голова
        ctx.beginPath();
        ctx.arc(x, 160, 35, 0, Math.PI * 2);
        ctx.fill();

        // Белые светящиеся глаза
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(x - 12, 158, 5, 0, Math.PI * 2);
        ctx.arc(x + 12, 158, 5, 0, Math.PI * 2);
        ctx.fill();

        // Свечение вокруг глаз
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(x - 12, 158, 12, 0, Math.PI * 2);
        ctx.arc(x + 12, 158, 12, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Никого нет — просто пустое светлое пятно у дверей
        ctx.fillStyle = 'rgba(255,248,220,0.1)';
        ctx.fillRect(60, 300, 120, 180);
        ctx.fillRect(460, 300, 120, 180);
    }
}

window.renderLightFlash = renderLightFlash;

document.addEventListener('DOMContentLoaded', init);
