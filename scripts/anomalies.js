// ============================================
// scripts/anomalies.js — Аномалии: спавн и отрисовка
// ============================================

const ANOMALIES = [
    { id: 'shadow',     weight: 10, lifetime: 5, damage: 5, hitRadius: 45, draw: drawAnomalyShadow },
    { id: 'chair',      weight: 8,  lifetime: 6, damage: 4, hitRadius: 55, draw: drawAnomalyChair },
    { id: 'door',       weight: 7,  lifetime: 5, damage: 5, hitRadius: 60, draw: drawAnomalyDoor },
    { id: 'text',       weight: 5,  lifetime: 3, damage: 6, hitRadius: 80, draw: drawAnomalyText },
    { id: 'reflection', weight: 6,  lifetime: 4, damage: 5, hitRadius: 40, draw: drawAnomalyReflection },
    { id: 'flicker',    weight: 6,  lifetime: 4, damage: 3, hitRadius: 40, draw: drawAnomalyFlicker },
    { id: 'eyes',       weight: 4,  lifetime: 3, damage: 8, hitRadius: 35, draw: drawAnomalyEyes }
];

const ANOMALY_SPAWNS = {
    shadow: {
        CAM1: [{x: 130, y: 320}, {x: 510, y: 340}],
        CAM2: [{x: 80, y: 300}, {x: 550, y: 300}],
        CAM3: [{x: 180, y: 350}, {x: 460, y: 350}],
        CAM4: [{x: 80, y: 380}, {x: 500, y: 380}]
    },
    chair: { CAM3: [{x: 220, y: 380}] },
    door: { CAM1: [{x: 90, y: 290}, {x: 550, y: 290}] },
    text: {
        CAM1: [{x: 320, y: 140}],
        CAM2: [{x: 320, y: 100}],
        CAM3: [{x: 320, y: 180}],
        CAM4: [{x: 320, y: 200}]
    },
    reflection: { CAM3: [{x: 540, y: 240}], CAM4: [{x: 320, y: 180}] },
    flicker: {
        CAM1: [{x: 320, y: 45}],
        CAM2: [{x: 160, y: 55}, {x: 480, y: 55}],
        CAM3: [{x: 320, y: 55}],
        CAM4: [{x: 200, y: 55}, {x: 440, y: 55}]
    },
    eyes: {
        CAM1: [{x: 260, y: 260}, {x: 380, y: 260}],
        CAM2: [{x: 320, y: 420}],
        CAM3: [{x: 480, y: 200}],
        CAM4: [{x: 400, y: 360}]
    }
};

function drawAnomalyShadow(ctx, x, y, time) {
    x = x + Math.sin(time * 3) * 1.5;
    ctx.save();

    const grad = ctx.createRadialGradient(x, y, 0, x, y, 60);
    grad.addColorStop(0, 'rgba(0,0,0,0.7)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - 60, y - 60, 120, 120);

    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(x - 10, y + 30, 8, 30);
    ctx.fillRect(x + 2, y + 30, 8, 30);
    ctx.fillRect(x - 16, y - 20, 32, 55);
    ctx.fillRect(x - 22, y - 15, 6, 45);
    ctx.fillRect(x + 16, y - 15, 6, 45);

    ctx.beginPath();
    ctx.arc(x, y - 30, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawAnomalyChair(ctx, x, y, time) {
    ctx.save();

    const pulse = 0.3 + Math.sin(time * 2) * 0.1;
    ctx.fillStyle = 'rgba(0,0,0,' + pulse + ')';
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 45, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x - 30, y - 5, 60, 12);

    ctx.save();
    ctx.translate(x + 25, y);
    ctx.rotate(0.4);
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(0, -8, 45, 10);
    ctx.restore();

    ctx.strokeStyle = '#1a0a00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 25, y);
    ctx.lineTo(x - 45, y + 15);
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x - 30, y + 25);
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 30, y + 22);
    ctx.stroke();

    ctx.restore();
}

function drawAnomalyDoor(ctx, x, y, time) {
    const left = x < 320;
    ctx.save();

    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 40, y - 90, 80, 180);

    if (left) {
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(x + 40, y - 90, 12, 180);
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(x + 40, y - 90, 2, 180);
        ctx.fillStyle = '#c9a227';
        ctx.beginPath();
        ctx.arc(x + 50, y, 3, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(x - 52, y - 90, 12, 180);
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(x - 42, y - 90, 2, 180);
        ctx.fillStyle = '#c9a227';
        ctx.beginPath();
        ctx.arc(x - 50, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    if (Math.floor(time * 2) % 3 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x - 15, y - 10, 3, 3);
        ctx.fillRect(x + 8, y - 10, 3, 3);
    }

    ctx.restore();
}

function drawAnomalyText(ctx, x, y, time) {
    const phrases = ['ОН СМОТРИТ', 'БЕГИ', 'НЕ ОБОРАЧИВАЙСЯ', 'ТЫ СЛЕДУЮЩИЙ', '06:00'];
    const idx = Math.floor((x + y) % phrases.length);
    const txt = phrases[idx];

    ctx.save();
    const flicker = 0.5 + Math.sin(time * 6) * 0.5;
    ctx.globalAlpha = flicker;

    ctx.translate(x, y);
    ctx.rotate(-0.05);

    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(139,0,0,0.4)';
    ctx.fillText(txt, 2, 2);

    ctx.fillStyle = '#8b0000';
    ctx.fillText(txt, 0, 0);

    ctx.fillStyle = 'rgba(255,100,100,0.3)';
    ctx.fillText(txt, 0, -1);

    ctx.restore();
}

function drawAnomalyReflection(ctx, x, y, time) {
    ctx.save();
    x = x + Math.sin(time * 1.5) * 2;

    const alpha = 0.12 + Math.sin(time * 3) * 0.05;
    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#c8c8c8';
    ctx.beginPath();
    ctx.ellipse(x, y, 22, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 2.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 8, y - 5, 3, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 1.8;
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y + 12, 8, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
}

function drawAnomalyFlicker(ctx, x, y, time) {
    const phase = (Math.sin(time * 20) + Math.sin(time * 7)) / 2;
    const bright = phase > 0 ? 1.0 : 0.2;

    ctx.save();

    if (bright > 0.5) {
        ctx.fillStyle = 'rgba(201,162,39,' + (0.08 * bright) + ')';
        ctx.beginPath();
        ctx.arc(x, y, 42, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = 'rgba(201,162,39,' + (0.15 * bright) + ')';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bright > 0.5 ? '#c9a227' : '#3a2a0a';
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();

    if (bright > 0.5) {
        ctx.fillStyle = '#fff8dc';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = '#8b6a17';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    if (bright < 0.5) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, 640, 480);
    }

    ctx.restore();
}

function drawAnomalyEyes(ctx, x, y, time) {
    ctx.save();
    x = x + Math.sin(time * 0.8) * 3;

    const phase = time % 2;
    const blinking = phase > 1.8 && phase < 2.0;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, 40);
    grad.addColorStop(0, 'rgba(0,0,0,0.7)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - 40, y - 40, 80, 80);

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 20, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    if (blinking) {
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(x - 12, y - 3, 6, 1);
        ctx.fillRect(x + 6, y - 3, 6, 1);
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 12, y - 4, 6, 6);
        ctx.fillRect(x + 6, y - 4, 6, 6);

        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(x - 9, y - 1, 10, 0, Math.PI * 2);
        ctx.arc(x + 9, y - 1, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function выбратьПоВесу(arr) {
    if (!arr || arr.length === 0) return null;
    if (arr.length === 1) return arr[0];

    let total = 0;
    for (let i = 0; i < arr.length; i++) {
        total += arr[i].weight || 0;
    }
    if (total <= 0) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    let r = Math.random() * total;
    for (let i = 0; i < arr.length; i++) {
        r -= (arr[i].weight || 0);
        if (r <= 0) return arr[i];
    }
    return arr[arr.length - 1];
}

function spawnAnomalyIfNeeded() {
    const cfg = getNightConfig(GameState.currentNight);
    if (GameState.anomalies.length >= cfg.maxAnomalies) return;
    if (GameState.lastAnomalySpawnTime + cfg.spawnInterval > GameState.elapsedTime) return;

    const занятые = GameState.anomalies.map(a => a.camera);
    const доступные = ['CAM1', 'CAM2', 'CAM3', 'CAM4'].filter(c => занятые.indexOf(c) === -1);
    if (доступные.length === 0) return;

    const camera = доступные[Math.floor(Math.random() * доступные.length)];

    const разрешённые = ANOMALIES.filter(a => cfg.allowedAnomalies.indexOf(a.id) !== -1);
    const тип = выбратьПоВесу(разрешённые);
    if (!тип) return;

    const точки = ANOMALY_SPAWNS[тип.id] && ANOMALY_SPAWNS[тип.id][camera];
    if (!точки || точки.length === 0) return;

    const точка = точки[Math.floor(Math.random() * точки.length)];
    const isFalse = cfg.falseAnomalies && Math.random() < 0.3;

    GameState.anomalies.push({
        id: тип.id,
        camera: camera,
        x: точка.x,
        y: точка.y,
        lifetime: тип.lifetime,
        damage: isFalse ? 0 : тип.damage,
        draw: тип.draw,
        hitRadius: тип.hitRadius,
        bornAt: GameState.elapsedTime,
        isFalse: isFalse
    });

    GameState.lastAnomalySpawnTime = GameState.elapsedTime;
}

function updateAnomalies(dt) {
    for (let i = GameState.anomalies.length - 1; i >= 0; i--) {
        const a = GameState.anomalies[i];
        const age = GameState.elapsedTime - a.bornAt;
        if (age >= a.lifetime) {
            if (!a.isFalse && GameState.monster) {
                GameState.monster.progress += a.damage;
            }
            if (typeof playWhisper === 'function') playWhisper();
            if (typeof registerAnomalyMissed === 'function') registerAnomalyMissed();
            GameState.anomalies.splice(i, 1);
        }
    }
}

window.ANOMALIES = ANOMALIES;
window.ANOMALY_SPAWNS = ANOMALY_SPAWNS;
window.выбратьПоВесу = выбратьПоВесу;
window.spawnAnomalyIfNeeded = spawnAnomalyIfNeeded;
window.updateAnomalies = updateAnomalies;
window.drawAnomalyShadow = drawAnomalyShadow;
window.drawAnomalyChair = drawAnomalyChair;
window.drawAnomalyDoor = drawAnomalyDoor;
window.drawAnomalyText = drawAnomalyText;
window.drawAnomalyReflection = drawAnomalyReflection;
window.drawAnomalyFlicker = drawAnomalyFlicker;
window.drawAnomalyEyes = drawAnomalyEyes;
