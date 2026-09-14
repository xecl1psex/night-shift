// ============================================
// scripts/save.js — Сохранения через localStorage
// ============================================

const SAVE_KEY = 'nightShift_save';

const DEFAULT_SAVE = {
    currentNight: 1,
    maxNightReached: 1,
    totalAnomaliesFixed: 0,
    totalAnomaliesMissed: 0,
    totalDeaths: 0,
    lastPlayed: 0
};

function saveGame(data) {
    try {
        const existing = loadGame();
        const merged = Object.assign({}, existing, data, {
            lastPlayed: Date.now()
        });
        localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
        return merged;
    } catch (e) {
        console.warn('Не удалось сохранить:', e);
        return Object.assign({}, DEFAULT_SAVE);
    }
}

function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return Object.assign({}, DEFAULT_SAVE);
        const data = JSON.parse(raw);
        return Object.assign({}, DEFAULT_SAVE, data);
    } catch (e) {
        return Object.assign({}, DEFAULT_SAVE);
    }
}

function resetGame() {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch (e) {}
    return Object.assign({}, DEFAULT_SAVE);
}

function hasSave() {
    try {
        return localStorage.getItem(SAVE_KEY) !== null;
    } catch (e) {
        return false;
    }
}

function saveProgress(nextNight, stats) {
    const current = loadGame();
    const updated = {
        currentNight: nextNight,
        maxNightReached: Math.max(current.maxNightReached, nextNight),
        totalAnomaliesFixed: current.totalAnomaliesFixed + (stats.fixed || 0),
        totalAnomaliesMissed: current.totalAnomaliesMissed + (stats.missed || 0),
        totalDeaths: current.totalDeaths + (stats.deaths || 0),
        lastPlayed: Date.now()
    };
    return saveGame(updated);
}

function registerDeath() {
    const current = loadGame();
    return saveGame({
        totalDeaths: current.totalDeaths + 1
    });
}

window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;
window.hasSave = hasSave;
window.saveProgress = saveProgress;
window.registerDeath = registerDeath;
