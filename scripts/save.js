// ============================================
// scripts/save.js — Сохранения через localStorage
// ============================================
// Я есть: Система сохранений в игре "СМЕНА". Использует
// localStorage браузера для персистентного хранения прогресса.
// Сохраняет: текущую ночь, максимальную достигнутую ночь,
// общую статистику (починено/пропущено аномалий, смерти),
// время последней игры. Предоставляет функции для загрузки,
// сохранения, сброса прогресса и проверки наличия сохранения.
// Автоматически обновляет timestamp при каждом сохранении.
// Работает с дефолтными значениями при отсутствии данных.
// ============================================

const SAVE_KEY = 'nightShift_save'; // Ключ для localStorage

const DEFAULT_SAVE = {
    currentNight: 1, // Текущая ночь (1-12)
    maxNightReached: 1, // Максимальная достигнутая ночь
    totalAnomaliesFixed: 0, // Всего починено аномалий
    totalAnomaliesMissed: 0, // Всего пропущено аномалий
    totalDeaths: 0, // Всего смертей
    lastPlayed: 0 // Timestamp последнего запуска (Date.now())
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
        console.log('[LOAD] Загружено:', data);
        return Object.assign({}, DEFAULT_SAVE, data);
    } catch (e) {
        return Object.assign({}, DEFAULT_SAVE);
    }
}

function resetGame() {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch (e) {}
    console.log('[RESET] Прогресс сброшен');
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
    console.log('[SAVE] Сохранено:', updated);
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
