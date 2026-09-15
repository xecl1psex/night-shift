// ============================================
// scripts/ui.js — Меню, HUD, обработчики
// ============================================
// Я есть: Система пользовательского интерфейса в игре "СМЕНА".
// Управляет главным меню (новая игра/продолжить), экранами
// управления и информации, внутриигровым HUD (ночь, время,
// энергия), переключением камер. Обрабатывает кнопки меню,
// паузу, возврат в меню, переход к следующей ночи. Отображает
// вступительный текст для каждой ночи с эффектом печатной
// машинки. Координирует сохранение/загрузку прогресса через
// save.js. Экспортирует функции для внешнего вызова.
// ============================================

function initMenu() {
    const btnNew = document.getElementById('btn-new');
    const btnContinue = document.getElementById('btn-continue');
    const saveNightSpan = document.getElementById('save-night');
    if (!btnNew || !btnContinue || !saveNightSpan) return;

    if (hasSave()) {
        const save = loadGame();
        btnContinue.style.display = 'block';
        saveNightSpan.textContent = save.currentNight;
        btnNew.textContent = 'НОВАЯ СМЕНА (СБРОС)';
    } else {
        btnContinue.style.display = 'none';
        btnNew.textContent = 'НОВАЯ СМЕНА';
    }
}

function bindMenuButtons() {
    const btnNew = document.getElementById('btn-new');
    if (btnNew) btnNew.addEventListener('click', () => {
        if (hasSave()) {
            const ok = confirm('Начать заново? Прогресс будет сброшен.');
            if (!ok) return;
            resetGame();
        }
        GameState.currentNight = 1;
        openIntro();
    });

    const btnContinue = document.getElementById('btn-continue');
    if (btnContinue) btnContinue.addEventListener('click', () => {
        const save = loadGame();
        GameState.currentNight = save.currentNight;
        openIntro();
    });

    const btnControls = document.getElementById('btn-controls');
    if (btnControls) btnControls.addEventListener('click', () => setMode('CONTROLS'));

    const btnAbout = document.getElementById('btn-about');
    if (btnAbout) btnAbout.addEventListener('click', () => setMode('ABOUT'));

    const btnBackControls = document.getElementById('btn-back-controls');
    if (btnBackControls) btnBackControls.addEventListener('click', () => setMode('MENU'));

    const btnBackAbout = document.getElementById('btn-back-about');
    if (btnBackAbout) btnBackAbout.addEventListener('click', () => setMode('MENU'));

    const btnStartShift = document.getElementById('btn-start-shift');
    if (btnStartShift) btnStartShift.addEventListener('click', () => startNightReal());

    const btnResume = document.getElementById('btn-resume');
    if (btnResume) btnResume.addEventListener('click', () => resumeGame());

    const btnQuit = document.getElementById('btn-quit');
    if (btnQuit) btnQuit.addEventListener('click', () => quitToMenu());

    const btnRetry = document.getElementById('btn-retry');
    if (btnRetry) btnRetry.addEventListener('click', () => openIntro());

    const btnMenuFromDead = document.getElementById('btn-menu-from-dead');
    if (btnMenuFromDead) btnMenuFromDead.addEventListener('click', () => quitToMenu());

    const btnNextNight = document.getElementById('btn-next-night');
    if (btnNextNight) btnNextNight.addEventListener('click', () => {
        GameState.currentNight++;
        saveGame();
        startNightReal();
    });
}

function openIntro() {
    setMode('INTRO');
    showIntroText(GameState.currentNight);
}

function showIntroText(night) {
    const lines = [
        'Ночь ' + night,
        '',
        'Ты принял работу ночного оператора.',
        'Здание старое. Камеры работают с помехами.',
        'Твоя задача — фиксировать аномалии.',
        'Не пропускай их. И не смотри слишком долго.',
        'Смена длится 6 часов.',
        'Удачи.'
    ];

    const container = document.getElementById('intro-text');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < lines.length; i++) {
        setTimeout(() => {
            container.innerHTML += lines[i] + '\n';
        }, i * 250);
    }
}

function updateHUD() {
    const nightEl = document.getElementById('hud-night');
    const timeEl = document.getElementById('hud-time');
    if (nightEl) nightEl.textContent = 'НОЧЬ ' + GameState.currentNight;
    if (timeEl) {
        const hh = String(GameState.gameHour).padStart(2, '0');
        const mm = String(GameState.gameMinute).padStart(2, '0');
        timeEl.textContent = hh + ':' + mm;
    }
}

function selectCamera(id) {
    if (GameState.mode !== 'PLAYING') return;
    if (!GameState.player) return;

    GameState.player.currentCam = id;
    if (typeof playClick === 'function') playClick();

    GameState.dom.miniCams.forEach(m => {
        const slot = m.canvas.parentElement;
        if (m.id === id) slot.classList.add('active');
        else slot.classList.remove('active');
    });

    const label = document.getElementById('cam-label');
    if (label) label.textContent = 'CAM ' + id.replace('CAM', '');

    if (GameState.monster) GameState.monster.freezeTimer = 0;
}

function pauseGame() {
    if (GameState.mode !== 'PLAYING') return;
    setMode('PAUSED');
}

function resumeGame() {
    if (GameState.mode !== 'PAUSED') return;
    setMode('PLAYING');
}

function quitToMenu() {
    if (typeof stopTick === 'function') stopTick();
    if (typeof stopHum === 'function') stopHum();
    GameState.humStarted = false;
    setMode('MENU');
}

window.initMenu = initMenu;
window.bindMenuButtons = bindMenuButtons;
window.openIntro = openIntro;
window.showIntroText = showIntroText;
window.updateHUD = updateHUD;
window.selectCamera = selectCamera;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;
window.quitToMenu = quitToMenu;
