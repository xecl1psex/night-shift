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

    // Автомат с едой в левом углу
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

    // Окно справа
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

    // Лампа сверху
    drawLamp(ctx, 320, 55, 16);

    // === СТОЛ ===
    // Столешница — компактная, толщиной 15px, по центру кадра на уровне Y 280-420
    // Основная поверхность (светлое дерево)
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(240, 280, 160, 120);
    
    // Верхняя кромка столешницы (блик)
    ctx.fillStyle = '#5a4530';
    ctx.fillRect(240, 280, 160, 15);
    
    // Передняя кромка столешницы (показывает толщину 15px)
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(240, 295, 160, 10);

    // 4 ножки стола по углам (толщина 8px, высота от столешницы до пола ~105px)
    ctx.fillStyle = '#2a1a10';
    // Передняя левая ножка
    ctx.fillRect(245, 295, 8, 105);
    // Передняя правая ножка
    ctx.fillRect(387, 295, 8, 105);
    // Задняя левая ножка
    ctx.fillRect(250, 285, 8, 95);
    // Задняя правая ножка
    ctx.fillRect(382, 285, 8, 95);

    // Тень под столом — овальная, полупрозрачная, чуть шире стола
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(320, 405, 90, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // === СТУЛЬЯ ===
    // Каждый стул: 4 ножки, сиденье 40×8px, спинка с вертикальными стойками + 2 перекладины
    // Цвета: ножки #2a1a10, сиденье #3a2a1a, спинка #1e1208
    
    // Задний левый стул (за столом, видна спинка, сиденье перекрыто столом)
    // Ножки (4 штуки по углам)
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(205, 340, 6, 70);   // передняя левая
    ctx.fillRect(238, 340, 6, 70);   // передняя правая
    ctx.fillRect(209, 325, 5, 55);   // задняя левая
    ctx.fillRect(234, 325, 5, 55);   // задняя правая
    // Сиденье (горизонтальный прямоугольник 40×8)
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(203, 335, 42, 8);
    // Спинка (вертикальные стойки + 2 горизонтальные перекладины)
    ctx.fillStyle = '#1e1208';
    ctx.fillRect(203, 265, 7, 70);   // левая стойка
    ctx.fillRect(238, 265, 7, 70);   // правая стойка
    ctx.fillRect(203, 265, 42, 7);   // верхняя перекладина
    ctx.fillRect(203, 298, 42, 6);   // средняя перекладина

    // Задний правый стул (за столом)
    // Ножки
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(392, 340, 6, 70);   // передняя левая
    ctx.fillRect(425, 340, 6, 70);   // передняя правая
    ctx.fillRect(396, 325, 5, 55);   // задняя левая
    ctx.fillRect(421, 325, 5, 55);   // задняя правая
    // Сиденье
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(390, 335, 42, 8);
    // Спинка
    ctx.fillStyle = '#1e1208';
    ctx.fillRect(390, 265, 7, 70);   // левая стойка
    ctx.fillRect(425, 265, 7, 70);   // правая стойка
    ctx.fillRect(390, 265, 42, 7);   // верхняя перекладина
    ctx.fillRect(390, 298, 42, 6);   // средняя перекладина

    // Передний левый стул (перед столом, спиной к зрителю)
    // Ножки
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(150, 365, 6, 55);   // передняя левая
    ctx.fillRect(183, 365, 6, 55);   // передняя правая
    ctx.fillRect(154, 350, 5, 45);   // задняя левая
    ctx.fillRect(179, 350, 5, 45);   // задняя правая
    // Сиденье (40×8 px)
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(148, 360, 42, 8);
    // Спинка (видна полностью)
    ctx.fillStyle = '#1e1208';
    ctx.fillRect(148, 280, 7, 80);   // левая стойка
    ctx.fillRect(183, 280, 7, 80);   // правая стойка
    ctx.fillRect(148, 280, 42, 7);   // верхняя перекладина
    ctx.fillRect(148, 315, 42, 6);   // средняя перекладина

    // Передний правый стул (перед столом, спиной к зрителю)
    // Ножки
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(447, 365, 6, 55);   // передняя левая
    ctx.fillRect(480, 365, 6, 55);   // передняя правая
    ctx.fillRect(451, 350, 5, 45);   // задняя левая
    ctx.fillRect(476, 350, 5, 45);   // задняя правая
    // Сиденье (40×8 px)
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(445, 360, 42, 8);
    // Спинка
    ctx.fillStyle = '#1e1208';
    ctx.fillRect(445, 280, 7, 80);   // левая стойка
    ctx.fillRect(480, 280, 7, 80);   // правая стойка
    ctx.fillRect(445, 280, 42, 7);   // верхняя перекладина
    ctx.fillRect(445, 315, 42, 6);   // средняя перекладина
}

function drawRoomCAM4(ctx) {
    drawBase(ctx);

    // Логотип S на стене
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

    // Большое окно в центре
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

    // Часы справа
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

    // Лампы
    drawLamp(ctx, 200, 55, 14);
    drawLamp(ctx, 440, 55, 14);

    // === ДИВАН СЛЕВА ===
    // Цвет — тёмно-красный, приглушённый
    // Цельная фигура: спинка 140×50, сиденье 140×35, подлокотники, 3 подушки, 4 ножки
    
    // Ножки дивана (4 штуки)
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(35, 395, 12, 15);   // передняя левая
    ctx.fillRect(173, 395, 12, 15);  // передняя правая
    ctx.fillRect(40, 385, 10, 12);   // задняя левая
    ctx.fillRect(168, 385, 10, 12);  // задняя правая

    // Подлокотники (два вертикальных прямоугольника по бокам, высота чуть выше сиденья)
    ctx.fillStyle = '#2e1c1c';
    ctx.fillRect(20, 330, 15, 65);   // левый подлокотник
    ctx.fillRect(185, 330, 15, 65);  // правый подлокотник

    // Сиденье — горизонтальный прямоугольник 140×35 px
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(25, 360, 170, 35);
    
    // Подушки на сиденье (3 штуки, чуть светлее)
    ctx.fillStyle = '#3a2020';
    ctx.fillRect(30, 363, 52, 28);
    ctx.fillRect(86, 363, 52, 28);
    ctx.fillRect(142, 363, 48, 28);

    // Спинка — вертикальный прямоугольник 140×50 px
    ctx.fillStyle = '#1e1210';
    ctx.fillRect(25, 310, 170, 50);
    
    // Подушки на спинке (3 штуки, чуть светлее основного)
    ctx.fillStyle = '#2e1c1c';
    ctx.fillRect(30, 315, 52, 42);
    ctx.fillRect(86, 315, 52, 42);
    ctx.fillRect(142, 315, 48, 42);

    // Тень под диваном
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(110, 412, 90, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // === РЕСЕПШН ===
    // Простая прямоугольная стойка без рёбер
    // Столешница — светлое дерево, толщиной 15px
    // Передняя стенка — тёмное дерево, от столешницы до пола
    
    // Тень под стойкой
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(360, 395, 200, 12);

    // Передняя стенка ресепшн — тёмное дерево (#2a1a10), от столешницы до пола (~70px высотой)
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(360, 330, 200, 70);

    // Столешница — светлое дерево (#4a3520), толщиной 15px
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(355, 315, 210, 15);
    
    // Блик на столешнице
    ctx.fillStyle = '#5a4530';
    ctx.fillRect(355, 315, 210, 4);

    // === МОНИТОР НА РЕСЕПШН ===
    // Прямоугольник 90×60 px, стоит на подставке 20×15 px
    // Корпус тёмно-серый, экран — тёмно-зелёный с лёгким свечением
    // Расположен по центру столешницы, чуть смещён влево
    
    // Подставка монитора
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(440, 330, 20, 15);
    
    // Корпус монитора (тёмно-серый #2a2a2a)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(405, 270, 90, 60);
    
    // Экран монитора (тёмно-зелёный с лёгким свечением)
    ctx.fillStyle = 'rgba(57,255,20,0.25)';
    ctx.fillRect(410, 275, 80, 50);
    
    // Рамка экрана
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(405, 270, 90, 60);
}

window.drawBase = drawBase;
window.drawLamp = drawLamp;
window.drawRoomCAM1 = drawRoomCAM1;
window.drawRoomCAM2 = drawRoomCAM2;
window.drawRoomCAM3 = drawRoomCAM3;
window.drawRoomCAM4 = drawRoomCAM4;
