// ============================================
// scripts/player.js — Энергия, двери, свет
// ============================================
// Я есть: Система управления игроком в игре "СМЕНА". Отвечает за
// создание объекта игрока с параметрами энергии, управление
// дверьми (лево/право), фонарём и отслеживание статистики
// починенных аномалий. Реализует расход энергии: базовый
// (0.05/сек), свет (+0.25/сек), двери (+0.18/сек каждая).
// При нулевой энергии отключает все устройства и ускоряет
// прогресс монстра. Управляет визуальным отображением полоски
// энергии (зелёный/жёлтый/красный) и эффектами низкой энергии.
// ============================================

function createPlayer() {
    const cfg = getNightConfig(GameState.currentNight);
    return {
        energy: cfg.startEnergy, // Текущая энергия (из конфига ночи)
        maxEnergy: cfg.startEnergy, // Максимальная энергия
        currentCam: 'CAM1', // Текущая активная камера
        doorLeft: false, // Левая дверь закрыта
        doorRight: false, // Правая дверь закрыта
        lightOn: false, // Фонарь включён
        anomaliesFixed: 0, // Количество починенных аномалий
        anomaliesMissed: 0 // Количество пропущенных аномалий
    };
}

function updateEnergy(dt) {
    const p = GameState.player;
    if (!p) return;
    if (p.energy <= 0) return;

    const cfg = getNightConfig(GameState.currentNight);
    // Базовый расход снижен с 0.08 до 0.05 для 6-минутной ночи
    let drain = 0.05;

    // Расход света снижен с 0.4 до 0.25
    if (p.lightOn) {
        drain += 0.25 * cfg.energyMultiplier;
    }
    // Расход дверей снижен с 0.3 до 0.18 каждая
    if (p.doorLeft) drain += 0.18;
    if (p.doorRight) drain += 0.18;

    p.energy -= drain * dt;

    if (p.energy <= 0) {
        p.energy = 0;
        p.lightOn = false;
        p.doorLeft = false;
        p.doorRight = false;
        if (GameState.monster) {
            GameState.monster.progress += 30;
            if (GameState.monster.progress > 100) GameState.monster.progress = 100;
        }
        if (typeof playWhisper === 'function') playWhisper();
    }
}

function toggleDoorLeft() {
    const p = GameState.player;
    if (!p || p.energy <= 0) return;
    p.doorLeft = !p.doorLeft;
    if (typeof playDoorClose === 'function') playDoorClose();
}

function toggleDoorRight() {
    const p = GameState.player;
    if (!p || p.energy <= 0) return;
    p.doorRight = !p.doorRight;
    if (typeof playDoorClose === 'function') playDoorClose();
}

function toggleLight() {
    const p = GameState.player;
    if (!p || p.energy <= 0) return;
    p.lightOn = !p.lightOn;
    if (typeof playClick === 'function') playClick();
}

function updateEnergyBar() {
    const p = GameState.player;
    if (!p) return;
    const fill = document.getElementById('energy-fill');
    if (!fill) return;
    const ratio = p.energy / p.maxEnergy;
    fill.style.width = (ratio * 100) + '%';

    if (ratio > 0.6) {
        fill.style.background = '#39ff14';
        fill.classList.remove('pulsing');
    } else if (ratio > 0.3) {
        fill.style.background = '#c9a227';
        fill.classList.remove('pulsing');
    } else {
        fill.style.background = '#ff2222';
        fill.classList.add('pulsing');
    }
}

function updateButtonIndicators() {
    const p = GameState.player;
    if (!p) return;
    const ratio = p.energy / p.maxEnergy;

    const lf = document.querySelector('#btn-door-left .btn-indicator-fill');
    const rf = document.querySelector('#btn-door-right .btn-indicator-fill');
    const lgf = document.querySelector('#btn-light .btn-indicator-fill');

    if (lf) lf.style.width = (p.doorLeft ? ratio : 1) * 100 + '%';
    if (rf) rf.style.width = (p.doorRight ? ratio : 1) * 100 + '%';
    if (lgf) lgf.style.width = (p.lightOn ? ratio : 1) * 100 + '%';
}

function updateDoorButtons() {
    const p = GameState.player;
    const m = GameState.monster;
    if (!p || !m) return;

    const btnL = document.getElementById('btn-door-left');
    const btnR = document.getElementById('btn-door-right');
    const btnLight = document.getElementById('btn-light');

    if (btnL) btnL.classList.toggle('closed', p.doorLeft);
    if (btnR) btnR.classList.toggle('closed', p.doorRight);
    if (btnLight) btnLight.classList.toggle('on', p.lightOn);

    if (btnL) btnL.classList.remove('knocking');
    if (btnR) btnR.classList.remove('knocking');

    if (m.state === 'DOOR') {
        if ((m.side === 'LEFT' || m.side === 'BOTH') && btnL) {
            btnL.classList.add('knocking');
        }
        if ((m.side === 'RIGHT' || m.side === 'BOTH') && btnR) {
            btnR.classList.add('knocking');
        }
    }
}

function updateLowEnergyEffects() {
    const p = GameState.player;
    if (!p) return;
    const game = document.getElementById('game');
    if (!game) return;
    const ratio = p.energy / p.maxEnergy;

    game.classList.toggle('low-energy', ratio < 0.2 && ratio > 0.1);
    game.classList.toggle('critical-energy', ratio <= 0.1);

    if (GameState.monster) {
        game.classList.toggle('danger', GameState.monster.progress > 70);
    }
}

window.createPlayer = createPlayer;
window.updateEnergy = updateEnergy;
window.toggleDoorLeft = toggleDoorLeft;
window.toggleDoorRight = toggleDoorRight;
window.toggleLight = toggleLight;
window.updateEnergyBar = updateEnergyBar;
window.updateButtonIndicators = updateButtonIndicators;
window.updateDoorButtons = updateDoorButtons;
window.updateLowEnergyEffects = updateLowEnergyEffects;
