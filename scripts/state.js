// ============================================
// scripts/state.js — Глобальное состояние игры
// ============================================

const GameState = {
    mode: 'BOOT',
    currentNight: 1,
    elapsedTime: 0,
    gameHour: 0,
    gameMinute: 0,
    scanY: -20,
    player: null,
    monster: null,
    anomalies: [],
    lastAnomalySpawnTime: 0,
    dom: {
        canvasActive: null,
        ctxActive: null,
        miniCams: [],
        jumpscareCanvas: null,
        jumpscareCtx: null
    },
    tickInterval: null,
    staticInterval: null,
    staticCacheBuffer: null,
    humStarted: false,
    stats: { fixed: 0, missed: 0, falseClicks: 0 }
};

const SCREEN_MAP = {
    BOOT: 'screen-boot',
    MENU: 'screen-menu',
    CONTROLS: 'screen-controls',
    ABOUT: 'screen-about',
    INTRO: 'screen-intro',
    PLAYING: 'screen-playing',
    PAUSED: 'screen-paused',
    JUMPSCARE: 'screen-playing',
    GAMEOVER: 'screen-gameover',
    NIGHT_COMPLETE: 'screen-night_complete',
    WIN: 'screen-win'
};

function setMode(newMode) {
    const oldMode = GameState.mode;
    GameState.mode = newMode;

    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });

    const screenId = SCREEN_MAP[newMode];
    if (screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            screen.style.display = 'flex';
        }
    }

    onModeChange(oldMode, newMode);
}

function onModeChange(oldMode, newMode) {
    if (newMode === 'PLAYING' && oldMode !== 'PAUSED') {
        if (typeof startHum === 'function' && !GameState.humStarted) {
            startHum();
            GameState.humStarted = true;
        }
        if (typeof startTick === 'function') startTick();
    }

    if (newMode === 'MENU' || newMode === 'GAMEOVER' || newMode === 'WIN') {
        if (typeof stopTick === 'function') stopTick();
        if (typeof stopHum === 'function') stopHum();
        GameState.humStarted = false;
    }

    if (newMode === 'JUMPSCARE') {
        if (typeof stopTick === 'function') stopTick();
        if (typeof startJumpscareRender === 'function') startJumpscareRender();
    }

    if (newMode === 'MENU') {
        if (typeof initMenu === 'function') initMenu();
    }
}

function resetNightState() {
    GameState.elapsedTime = 0;
    GameState.gameHour = 0;
    GameState.gameMinute = 0;
    GameState.scanY = -20;
    GameState.anomalies = [];
    GameState.lastAnomalySpawnTime = 0;
    GameState.stats = { fixed: 0, missed: 0, falseClicks: 0 };
}

function resetAllState() {
    resetNightState();
    GameState.currentNight = 1;
    GameState.player = null;
    GameState.monster = null;
}

function registerAnomalyFixed() {
    GameState.stats.fixed++;
    if (GameState.player) GameState.player.anomaliesFixed++;
}

function registerAnomalyMissed() {
    GameState.stats.missed++;
    if (GameState.player) GameState.player.anomaliesMissed++;
}

function registerFalseClick() {
    GameState.stats.falseClicks++;
}

window.GameState = GameState;
window.setMode = setMode;
window.resetNightState = resetNightState;
window.resetAllState = resetAllState;
window.registerAnomalyFixed = registerAnomalyFixed;
window.registerAnomalyMissed = registerAnomalyMissed;
window.registerFalseClick = registerFalseClick;
