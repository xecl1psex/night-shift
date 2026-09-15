// ============================================
// scripts/monster.js — ИИ монстра и отрисовка
// ============================================

function createMonster() {
    return {
        progress: 0,
        state: 'HIDDEN',
        position: null,
        freezeTimer: 0,
        stepCooldown: 0,
        side: null,
        doorTimer: 0
    };
}

function nextCamera(current) {
    const order = ['CAM1', 'CAM2', 'CAM3', 'CAM4'];
    const i = order.indexOf(current);
    if (i === -1) return 'CAM1';
    return order[(i + 1) % 4];
}

function nextCameraInHunt(current) {
    const order = ['CAM1', 'CAM2', 'CAM3', 'CAM4'];
    const i = order.indexOf(current);
    if (i === -1 || i >= 3) return 'CAM4';
    return order[i + 1];
}

function randomCamera() {
    const cams = ['CAM1', 'CAM2', 'CAM3', 'CAM4'];
    return cams[Math.floor(Math.random() * 4)];
}

function randomCameraExcept(cam) {
    const cams = ['CAM1', 'CAM2', 'CAM3', 'CAM4'].filter(c => c !== cam);
    return cams[Math.floor(Math.random() * cams.length)];
}

function doorЗакрыта(side) {
    if (!GameState.player) return false;
    if (side === 'LEFT') return GameState.player.doorLeft;
    if (side === 'RIGHT') return GameState.player.doorRight;
    if (side === 'BOTH') return GameState.player.doorLeft && GameState.player.doorRight;
    return false;
}

function monsterTick(dt) {
    const m = GameState.monster;
    if (!m) return;
    const cfg = getNightConfig(GameState.currentNight);

    m.progress += cfg.passiveProgress * dt;
    if (m.progress > 100) m.progress = 100;
    if (m.progress < 0) m.progress = 0;

    m.stepCooldown -= dt;
    if (m.state === 'DOOR') m.doorTimer -= dt;

    if (GameState.player && GameState.player.currentCam === m.position) {
        m.freezeTimer += dt;
        if (m.freezeTimer >= cfg.monsterTeleportAfter) {
            m.position = randomCameraExcept(GameState.player.currentCam);
            m.progress += 10;
            if (m.progress > 100) m.progress = 100;
            m.freezeTimer = 0;
        }
    } else {
        m.freezeTimer = 0;
    }

    // Update ambient music based on monster progress
    if (typeof window.setAmbientMode === 'function') {
        if (m.progress >= 70 && window.currentAmbientMode !== 'danger') {
            window.setAmbientMode('danger');
        } else if (m.progress >= 40 && window.currentAmbientMode !== 'tense') {
            window.setAmbientMode('tense');
        } else if (m.progress < 40 && window.currentAmbientMode !== 'calm') {
            window.setAmbientMode('calm');
        }
    }

    if (m.state === 'HIDDEN' && m.progress >= 20) {
        m.state = 'WANDER';
        m.position = randomCamera();
        m.stepCooldown = cfg.moveInterval;
    }

    if (m.state === 'WANDER') {
        if (m.progress >= 50) {
            m.state = 'HUNT';
            m.position = 'CAM1';
            m.stepCooldown = cfg.moveInterval;
        } else if (m.stepCooldown <= 0) {
            m.position = nextCamera(m.position);
            m.stepCooldown = cfg.moveInterval;
        }
    }

    if (m.state === 'HUNT') {
        if (m.progress < 40) {
            m.state = 'WANDER';
        } else if (m.position === 'CAM4' && m.progress >= 80) {
            m.state = 'DOOR';
            if (cfg.doubleDoor && Math.random() < 0.5) {
                m.side = 'BOTH';
                m.doorTimer = cfg.doorTimer + 0.5;
            } else {
                m.side = Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
                m.doorTimer = cfg.doorTimer;
            }
            if (typeof playKnock === 'function') playKnock();
        } else if (m.stepCooldown <= 0) {
            m.position = nextCameraInHunt(m.position);
            m.stepCooldown = cfg.moveInterval;
        }
    }

    if (m.state === 'DOOR') {
        if (doorЗакрыта(m.side)) {
            m.state = 'HUNT';
            m.position = 'CAM4';
            m.progress -= 20;
            if (m.progress < 0) m.progress = 0;
            m.stepCooldown = cfg.moveInterval;
            if (typeof playDoorClose === 'function') playDoorClose();
        } else if (m.doorTimer <= 0) {
            m.state = 'ATTACK';
            if (typeof triggerJumpscare === 'function') triggerJumpscare();
        } else if (m.progress < 60) {
            m.state = 'WANDER';
        }
    }
}

function drawMonster(ctx, x, y, state, scale) {
    if (!scale) scale = 1;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, 100 * scale);
    grad.addColorStop(0, 'rgba(0,0,0,0.5)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - 150, y - 150, 300, 300);

    ctx.save();
    ctx.translate(x + (Math.random() - 0.5) * 2, y + (Math.random() - 0.5) * 2);
    ctx.scale(scale, scale);

    if (state === 'HUNT') {
        drawMonsterHunt(ctx);
    } else {
        drawMonsterIdle(ctx);
    }

    ctx.restore();

    if (GameState.monster && GameState.monster.freezeTimer > 3) {
        ctx.fillStyle = 'rgba(255,0,0,' + ((GameState.monster.freezeTimer - 3) * 0.05) + ')';
        ctx.fillRect(0, 0, 640, 480);
    }
}

function drawMonsterIdle(ctx) {
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(-14, 40, 14, 70);
    ctx.fillRect(0, 40, 14, 70);
    ctx.fillRect(-25, -80, 50, 120);

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-37, -70, 12, 90);
    ctx.fillRect(25, -70, 12, 90);

    ctx.beginPath();
    ctx.arc(0, -100, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(-10, -105, 4, 4);
    ctx.fillRect(6, -105, 4, 4);
}

function drawMonsterHunt(ctx) {
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(-20, 40, 14, 70);
    ctx.fillRect(6, 40, 14, 70);

    ctx.save();
    ctx.rotate(-0.15);

    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(-25, -80, 50, 120);

    ctx.fillStyle = '#0a0a0a';
    ctx.save();
    ctx.translate(-25, -50);
    ctx.rotate(0.6);
    ctx.fillRect(-12, 0, 12, 100);
    ctx.restore();

    ctx.save();
    ctx.translate(25, -50);
    ctx.rotate(-0.6);
    ctx.fillRect(0, 0, 12, 100);
    ctx.restore();

    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(0, -95, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ff2222';
    ctx.fillRect(-10, -100, 5, 5);
    ctx.fillRect(5, -100, 5, 5);

    ctx.restore();
}

function drawMonsterDoor(ctx, side) {
    const x = side === 'LEFT' ? 80 : 1200;
    const y = 700;
    const pulse = 0.6 + Math.sin(GameState.elapsedTime * 4) * 0.4;

    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(x - 100, y - 40, 200, 40);

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x - 20, y - 30, 6, 6);
    ctx.fillRect(x + 14, y - 30, 6, 6);
    ctx.restore();
}

window.createMonster = createMonster;
window.monsterTick = monsterTick;
window.drawMonster = drawMonster;
window.drawMonsterIdle = drawMonsterIdle;
window.drawMonsterHunt = drawMonsterHunt;
window.drawMonsterDoor = drawMonsterDoor;
window.nextCamera = nextCamera;
window.nextCameraInHunt = nextCameraInHunt;
window.randomCamera = randomCamera;
window.randomCameraExcept = randomCameraExcept;
window.doorЗакрыта = doorЗакрыта;
