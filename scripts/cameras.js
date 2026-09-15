// ============================================
// scripts/cameras.js — Отрисовка 4 комнат
// ============================================
// Я есть: Графический движок камер в игре "СМЕНА". Отрисовывает
// 4 комнаты (CAM1-CAM4) процедурно через Canvas API без внешних
// изображений. Каждая комната имеет уникальную геометрию:
// CAM1 — главный коридор с двумя дверями, CAM2 — склад с
// коробками, CAM3 — помещение со стулом и окном, CAM4 —
// дальний коридор с лестницей. Включает базовую отрисовку
// стен/пола/потолка, лампы с градиентным освещением, двери,
// окна и декоративные элементы. Все координаты жёстко заданы
// для сохранения консистентности между ночами.
// ============================================

function drawBase(ctx) {
    ctx.fillStyle = '#0f0f0f'; // Потолок
    ctx.fillRect(0, 0, 640, 80);
    ctx.fillStyle = '#1a1a1a'; // Стены
    ctx.fillRect(0, 80, 640, 320);
    ctx.fillStyle = '#252525'; // Пол
    ctx.fillRect(0, 400, 640, 80);

    ctx.strokeStyle = '#1a1a1a'; // Линии пола
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const y = 400 + i * 10;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
    }

    ctx.fillStyle = '#0a0a0a'; // Плинтус
    ctx.fillRect(0, 395, 640, 5);
}

function drawLamp(ctx, x, y, radius) {
    ctx.fillStyle = 'rgba(201,162,39,0.08)';
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(201,162,39,0.15)';
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff8dc';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawRoomCAM1(ctx) {
    drawBase(ctx);

    ctx.fillStyle = '#151515';
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(220, 180);
    ctx.lineTo(220, 400);
    ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(640, 80);
    ctx.lineTo(420, 180);
    ctx.lineTo(420, 400);
    ctx.lineTo(640, 400);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(220, 180, 200, 220);

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(260, 220, 120, 180);
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(260, 220, 120, 180);
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(370, 310, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(80, 200, 80, 180);
    ctx.strokeStyle = '#2a2a2a';
    ctx.strokeRect(80, 200, 80, 180);
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(150, 290, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(480, 200, 80, 180);
    ctx.strokeStyle = '#2a2a2a';
    ctx.strokeRect(480, 200, 80, 180);
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(490, 290, 3, 0, Math.PI * 2);
    ctx.fill();

    drawLamp(ctx, 200, 55, 14);
    drawLamp(ctx, 320, 45, 16);
    drawLamp(ctx, 440, 55, 14);

    ctx.fillStyle = '#0f0f0f';
    const spots = [
        {x: 120, y: 430, w: 60, h: 12},
        {x: 480, y: 445, w: 80, h: 14},
        {x: 300, y: 460, w: 50, h: 10},
        {x: 200, y: 420, w: 40, h: 8}
    ];
    for (const p of spots) {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function getServerLightColor(x, i, time) {
    const seed = x * 100 + i;
    const r = (Math.sin(seed + Math.floor(time * 2)) + 1) / 2;
    if (r < 0.5) return '#39ff14';
    if (r < 0.8) return '#c9a227';
    return '#ff2222';
}

function drawRoomCAM2(ctx) {
    drawBase(ctx);

    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 80, 640, 320);

    const positionsX = [60, 160, 260, 360, 460, 560];
    const t = (typeof GameState !== 'undefined' && GameState.elapsedTime) ? GameState.elapsedTime : 0;

    for (const x of positionsX) {
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x, 120, 60, 280);
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 120, 60, 280);

        for (let i = 0; i < 8; i++) {
            const y = 140 + i * 30;
            ctx.fillStyle = getServerLightColor(x, i, t);
            ctx.fillRect(x + 10, y, 40, 6);
        }

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x, 380, 60, 20);
    }

    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 3;
    const cables = [
        [[60, 400], [100, 440], [200, 460]],
        [[160, 400], [180, 450], [300, 470]],
        [[360, 400], [380, 445], [500, 460]],
        [[460, 400], [420, 450], [300, 470]],
        [[560, 400], [540, 440], [450, 460]]
    ];
    for (const cable of cables) {
        ctx.beginPath();
        ctx.moveTo(cable[0][0], cable[0][1]);
        for (let j = 1; j < cable.length; j++) {
            ctx.lineTo(cable[j][0], cable[j][1]);
        }
        ctx.stroke();
    }

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(270, 400, 100, 60);
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(270, 400, 100, 60);
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(360, 425, 10, 4);

    drawLamp(ctx, 160, 55, 14);
    drawLamp(ctx, 480, 55, 14);
}

function drawRoomCAM3(ctx) {
    drawBase(ctx);

    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(200, 380, 8, 40);
    ctx.fillRect(440, 380, 8, 40);
    ctx.fillRect(200, 300, 8, 20);
    ctx.fillRect(440, 300, 8, 20);

    ctx.fillStyle = '#4a3520';
    ctx.fillRect(190, 300, 260, 20);
    ctx.fillStyle = '#5a4530';
    ctx.fillRect(190, 300, 260, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(190, 320, 260, 60);

    const chairs = [
        {x: 140, y: 320},
        {x: 500, y: 320},
        {x: 240, y: 260},
        {x: 400, y: 260}
    ];
    for (const s of chairs) {
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(s.x, s.y, 40, 40);
        ctx.fillStyle = '#2a1a10';
        ctx.fillRect(s.x, s.y - 50, 40, 50);
        ctx.strokeStyle = '#1a0a00';
        ctx.lineWidth = 1;
        ctx.strokeRect(s.x, s.y, 40, 40);
    }

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(40, 200, 80, 200);
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 200, 80, 200);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(55, 220, 50, 120);

    const foodColors = ['#c9a227', '#8b0000', '#39ff14', '#4a3520', '#5a5a5a', '#c9a227'];
    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = foodColors[i];
        ctx.fillRect(65, 235 + i * 18, 30, 12);
    }

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(460, 140, 160, 200);
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 3;
    ctx.strokeRect(460, 140, 160, 200);
    ctx.beginPath();
    ctx.moveTo(540, 140);
    ctx.lineTo(540, 340);
    ctx.moveTo(460, 240);
    ctx.lineTo(620, 240);
    ctx.stroke();

    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(490, 180, 2, 2);
    ctx.fillRect(580, 200, 2, 2);
    ctx.fillRect(520, 300, 2, 2);

    drawLamp(ctx, 320, 55, 16);
}

function drawRoomCAM4(ctx) {
    drawBase(ctx);

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(120, 80, 400, 220);

    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(320, 150, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#e8e8e8';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 320, 152);

    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(120, 300, 400, 120);
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(120, 300, 400, 15);
    ctx.fillStyle = '#5a4530';
    ctx.fillRect(120, 300, 400, 4);

    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(40, 340, 140, 80);
    ctx.fillStyle = '#3a2a2a';
    ctx.fillRect(50, 350, 40, 60);
    ctx.fillRect(95, 350, 40, 60);
    ctx.fillRect(140, 350, 30, 60);

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(170, 100, 300, 160);
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 4;
    ctx.strokeRect(170, 100, 300, 160);
    ctx.beginPath();
    ctx.moveTo(320, 100);
    ctx.lineTo(320, 260);
    ctx.moveTo(170, 180);
    ctx.lineTo(470, 180);
    ctx.stroke();

    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(540, 120, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 2;
    ctx.stroke();

    const hour = (typeof GameState !== 'undefined' && GameState.gameHour) ? GameState.gameHour : 0;
    const minute = (typeof GameState !== 'undefined' && GameState.gameMinute) ? GameState.gameMinute : 0;
    const hourAngle = (hour % 12) * (Math.PI * 2 / 12) - Math.PI / 2;
    const minAngle = minute * (Math.PI * 2 / 60) - Math.PI / 2;

    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(540, 120);
    ctx.lineTo(540 + Math.cos(hourAngle) * 15, 120 + Math.sin(hourAngle) * 15);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(540, 120);
    ctx.lineTo(540 + Math.cos(minAngle) * 22, 120 + Math.sin(minAngle) * 22);
    ctx.stroke();

    drawLamp(ctx, 200, 55, 14);
    drawLamp(ctx, 440, 55, 14);
}

window.drawBase = drawBase;
window.drawLamp = drawLamp;
window.drawRoomCAM1 = drawRoomCAM1;
window.drawRoomCAM2 = drawRoomCAM2;
window.drawRoomCAM3 = drawRoomCAM3;
window.drawRoomCAM4 = drawRoomCAM4;
