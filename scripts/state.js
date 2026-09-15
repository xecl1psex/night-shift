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
        // Start ambient music
        if (typeof window.initAudio === 'function') {
            window.initAudio();
        }
        if (typeof window.startAmbient === 'function') {
            window.startAmbient();
            window.setAmbientMode('calm');
        }
        if (typeof startTick === 'function') startTick();
    }

    if (newMode === 'PAUSED') {
        if (typeof window.setAmbientMode === 'function') {
            window.setAmbientMode('off');
        }
    }

    if (newMode === 'MENU' || newMode === 'GAMEOVER' || newMode === 'WIN') {
        if (typeof stopTick === 'function') stopTick();
        if (typeof stopHum === 'function') stopHum();
        if (typeof window.stopAmbient === 'function') {
            window.stopAmbient();
        }
        GameState.humStarted = false;
    }

    if (newMode === 'JUMPSCARE') {
        if (typeof stopTick === 'function') stopTick();
        if (typeof window.setAmbientMode === 'function') {
            window.setAmbientMode('danger');
        }
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

// ============================================
// NIGHT_CONFIG — баланс 12 ночей
// ============================================

const NIGHT_CONFIG = {
    1:  { startEnergy:100, spawnInterval:10,  moveInterval:12,  passiveProgress:0,   maxAnomalies:1, allowedAnomalies:['shadow','flicker','chair'],                                                     monsterTeleportAfter:6, doorTimer:3,   falseAnomalies:false, doubleDoor:false, energyMultiplier:1 },
    2:  { startEnergy:97,  spawnInterval:8,   moveInterval:11,  passiveProgress:0,   maxAnomalies:1, allowedAnomalies:['shadow','flicker','chair','door','text'],                                    monsterTeleportAfter:6, doorTimer:3,   falseAnomalies:false, doubleDoor:false, energyMultiplier:1 },
    3:  { startEnergy:94,  spawnInterval:7,   moveInterval:10,  passiveProgress:0,   maxAnomalies:1, allowedAnomalies:['shadow','flicker','chair','door','text','eyes'],                               monsterTeleportAfter:5, doorTimer:3,   falseAnomalies:false, doubleDoor:false, energyMultiplier:1 },
    4:  { startEnergy:91,  spawnInterval:6,   moveInterval:9,   passiveProgress:0,   maxAnomalies:2, allowedAnomalies:['shadow','flicker','chair','door','text','eyes','reflection'],                 monsterTeleportAfter:5, doorTimer:3,   falseAnomalies:false, doubleDoor:false, energyMultiplier:1 },
    5:  { startEnergy:88,  spawnInterval:5.5, moveInterval:8,   passiveProgress:0.5, maxAnomalies:2, allowedAnomalies:['shadow','flicker','chair','door','text','eyes','reflection'],                 monsterTeleportAfter:5, doorTimer:3,   falseAnomalies:false, doubleDoor:false, energyMultiplier:1 },
    6:  { startEnergy:85,  spawnInterval:5,   moveInterval:7.5, passiveProgress:0.5, maxAnomalies:2, allowedAnomalies:['shadow','flicker','chair','door','text','eyes','reflection'],                 monsterTeleportAfter:4, doorTimer:3,   falseAnomalies:false, doubleDoor:false, energyMultiplier:1 },
    7:  { startEnergy:82,  spawnInterval:4.5, moveInterval:7,   passiveProgress:0.6, maxAnomalies:3, allowedAnomalies:['shadow','flicker','chair','door','text','eyes','reflection'],                 monsterTeleportAfter:4, doorTimer:3,   falseAnomalies:false, doubleDoor:true,  energyMultiplier:1 },
    8:  { startEnergy:79,  spawnInterval:4,   moveInterval:6.5, passiveProgress:0.7, maxAnomalies:3, allowedAnomalies:['shadow','flicker','chair','door','text','eyes','reflection'],                 monsterTeleportAfter:4, doorTimer:3,   falseAnomalies:true,  doubleDoor:false, energyMultiplier:1 },
    9:  { startEnergy:76,  spawnInterval:3.5, moveInterval:6,   passiveProgress:0.8, maxAnomalies:3, allowedAnomalies:['shadow','flicker','chair','door','text','eyes','reflection'],                 monsterTeleportAfter:3, doorTimer:3,   falseAnomalies:true,  doubleDoor:false, energyMultiplier:1 },
    10: { startEnergy:73,  spawnInterval:3,   moveInterval:5.5, passiveProgress:1.0, maxAnomalies:3, allowedAnomalies:['shadow','flicker','chair','door','text','eyes','reflection'],                 monsterTeleportAfter:3, doorTimer:2.5, falseAnomalies:true,  doubleDoor:false, energyMultiplier:2 },
    11: { startEnergy:70,  spawnInterval:2.5, moveInterval:5,   passiveProgress:1.2, maxAnomalies:4, allowedAnomalies:['shadow','flicker','chair','door','text','eyes','reflection'],                 monsterTeleportAfter:3, doorTimer:2.5, falseAnomalies:true,  doubleDoor:true,  energyMultiplier:2 },
    12: { startEnergy:67,  spawnInterval:2,   moveInterval:4.5, passiveProgress:1.5, maxAnomalies:4, allowedAnomalies:['shadow','flicker','chair','door','text','eyes','reflection'],                 monsterTeleportAfter:2, doorTimer:2,   falseAnomalies:true,  doubleDoor:true,  energyMultiplier:2 }
};

function getNightConfig(n) {
    return NIGHT_CONFIG[n] || NIGHT_CONFIG[12];
}

window.NIGHT_CONFIG = NIGHT_CONFIG;
window.getNightConfig = getNightConfig;
