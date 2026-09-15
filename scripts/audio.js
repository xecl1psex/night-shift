// ============================================
// scripts/audio.js — Web Audio API генератор звуков
// ============================================
// Я есть: Звуковой движок игры "СМЕНА". Генерирует все звуки
// процедурно через Web Audio API без использования внешних файлов.
// Создаёт атмосферные эффекты (гул, шёпот, скрежет), звуковые
// сигналы интерфейса и динамическую фоновую музыку на трёх
// осцилляторах с фильтрами. Управляет мастер-громкостью и
// контекстом аудио, автоматически приостанавливая/возобновляя
// воспроизведение в зависимости от состояния игры.
// ============================================

let audioCtx = null; // Аудио-контекст Web Audio API
let masterGain = null; // Мастер-канал громкости
let humOscillator = null; // Фоновый гул (осциллятор 1)
let humGain = null; // Громкость фонового гула
let humOscillator2 = null; // Фоновый гул (осциллятор 2)
let lastWhisperTime = 0; // Время последнего звука шёпота
let lastClickTime = 0; // Время последнего клика
let lastMissClickTime = 0; // Время последнего промаха по аномалии

// Переменные для фоновой музыки (ambient)
let ambientOsc1 = null; // Низкий дрон (sine, 55 Гц)
let ambientOsc2 = null; // Кварта выше (sine, 82.4 Гц)
let ambientOsc3 = null; // Лёгкий гул (triangle, 110 Гц)
let ambientGain = null; // Общая громкость музыки
let ambientFilter = null; // Lowpass-фильтр для музыки
let currentAmbientMode = null; // Текущий режим музыки: calm/tense/danger/off

window.getAudioContextTime = function() {
    return audioCtx ? audioCtx.currentTime : 0;
};

function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(audioCtx.destination);
    } catch (e) {
        console.warn('Web Audio API недоступен:', e);
    }
}

function startHum() {
    if (!audioCtx || humOscillator) return;

    humOscillator = audioCtx.createOscillator();
    humOscillator.type = 'sine';
    humOscillator.frequency.value = 60;

    humGain = audioCtx.createGain();
    humGain.gain.value = 0.08;

    humOscillator.connect(humGain);
    humGain.connect(masterGain);
    humOscillator.start();

    humOscillator2 = audioCtx.createOscillator();
    humOscillator2.type = 'sawtooth';
    humOscillator2.frequency.value = 30;

    const humGain2 = audioCtx.createGain();
    humGain2.gain.value = 0.02;

    humOscillator2.connect(humGain2);
    humGain2.connect(masterGain);
    humOscillator2.start();
}

function stopHum() {
    if (humOscillator) {
        try { humOscillator.stop(); } catch (e) {}
        humOscillator = null;
    }
    if (humOscillator2) {
        try { humOscillator2.stop(); } catch (e) {}
        humOscillator2 = null;
    }
    humGain = null;
}

function playClick() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    if (now - lastClickTime < 0.05) return;
    lastClickTime = now;

    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 800;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
}

function playWhisper() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    if (now - lastWhisperTime < 0.25) return;
    lastWhisperTime = now;

    const bufferSize = Math.floor(audioCtx.sampleRate * 0.4);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const shum = audioCtx.createBufferSource();
    shum.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    shum.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    shum.start(now);
    shum.stop(now + 0.4);
}

function playKnock() {
    if (!audioCtx) return;
    for (let i = 0; i < 3; i++) {
        const delay = i * 0.15;
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 120;

        const gain = audioCtx.createGain();
        const start = audioCtx.currentTime + delay;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.4, start + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(start);
        osc.stop(start + 0.1);
    }
}

function playDoorClose() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.3);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const shum = audioCtx.createBufferSource();
    shum.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 5;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    shum.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    shum.start(now);
    shum.stop(now + 0.3);

    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 80;
    const gain2 = audioCtx.createGain();
    gain2.gain.setValueAtTime(0.3, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain2);
    gain2.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
}

function playScream() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(3000, now + 1.0);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.2);

    const bufferSize = Math.floor(audioCtx.sampleRate * 1.2);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const shum = audioCtx.createBufferSource();
    shum.buffer = buffer;
    const shumGain = audioCtx.createGain();
    shumGain.gain.setValueAtTime(0.4, now);
    shumGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    shum.connect(shumGain);
    shumGain.connect(masterGain);
    shum.start(now);
    shum.stop(now + 1.2);
}

function playStatic(intensity) {
    if (!audioCtx) return;
    if (intensity < 0.1) return;

    if (!GameState.staticCacheBuffer) {
        const bufferSize = Math.floor(audioCtx.sampleRate * 0.1);
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        GameState.staticCacheBuffer = buffer;
    }

    const now = audioCtx.currentTime;
    const source = audioCtx.createBufferSource();
    source.buffer = GameState.staticCacheBuffer;
    source.loop = false;

    const gain = audioCtx.createGain();
    gain.gain.value = intensity * 0.08;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(now);
    source.stop(now + 0.15);
}

function playHeartbeat() {
    if (!audioCtx) return;
    for (let i = 0; i < 2; i++) {
        const delay = i * 0.25;
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 60;

        const gain = audioCtx.createGain();
        const start = audioCtx.currentTime + delay;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.4, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(start);
        osc.stop(start + 0.2);
    }
}

function stopAllAudio() {
    stopHum();
    stopAmbient();
    if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
        audioCtx = null;
    }
}

function startAmbient() {
    if (!audioCtx || ambientOsc1) return;
    
    const now = audioCtx.currentTime;
    
    // osc1 — sine, 55 Гц (низкий дрон)
    ambientOsc1 = audioCtx.createOscillator();
    ambientOsc1.type = 'sine';
    ambientOsc1.frequency.value = 55;
    
    const gain1 = audioCtx.createGain();
    gain1.gain.value = 0.05;
    ambientOsc1.connect(gain1);
    
    // osc2 — sine, 82.4 Гц (кварта выше)
    ambientOsc2 = audioCtx.createOscillator();
    ambientOsc2.type = 'sine';
    ambientOsc2.frequency.value = 82.4;
    
    const gain2 = audioCtx.createGain();
    gain2.gain.value = 0.03;
    ambientOsc2.connect(gain2);
    
    // osc3 — triangle, 110 Гц (лёгкий гул)
    ambientOsc3 = audioCtx.createOscillator();
    ambientOsc3.type = 'triangle';
    ambientOsc3.frequency.value = 110;
    
    const gain3 = audioCtx.createGain();
    gain3.gain.value = 0.02;
    ambientOsc3.connect(gain3);
    
    // Общий ambientGain
    ambientGain = audioCtx.createGain();
    ambientGain.gain.value = 0.15;
    
    // Фильтр lowpass
    ambientFilter = audioCtx.createBiquadFilter();
    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.value = 300;
    ambientFilter.Q.value = 1;
    
    // Подключение: все осцилляторы → ambientGain → ambientFilter → masterGain
    gain1.connect(ambientGain);
    gain2.connect(ambientGain);
    gain3.connect(ambientGain);
    ambientGain.connect(ambientFilter);
    ambientFilter.connect(masterGain);
    
    // Запуск всех осцилляторов
    ambientOsc1.start(now);
    ambientOsc2.start(now);
    ambientOsc3.start(now);
    
    currentAmbientMode = 'calm';
}

function setAmbientMode(mode) {
    if (!audioCtx || !ambientOsc1 || mode === currentAmbientMode) return;
    
    const now = audioCtx.currentTime;
    currentAmbientMode = mode;
    
    if (mode === 'calm') {
        ambientOsc1.frequency.linearRampToValueAtTime(55, now + 1);
        ambientOsc2.frequency.linearRampToValueAtTime(82.4, now + 1);
        ambientOsc3.frequency.linearRampToValueAtTime(110, now + 1);
        ambientFilter.frequency.linearRampToValueAtTime(300, now + 1);
        ambientGain.gain.linearRampToValueAtTime(0.15, now + 1);
    } else if (mode === 'tense') {
        ambientOsc1.frequency.linearRampToValueAtTime(58, now + 0.8);
        ambientOsc2.frequency.linearRampToValueAtTime(87, now + 0.8);
        ambientOsc3.frequency.linearRampToValueAtTime(116, now + 0.8);
        ambientFilter.frequency.linearRampToValueAtTime(500, now + 0.8);
        ambientGain.gain.linearRampToValueAtTime(0.22, now + 0.8);
    } else if (mode === 'danger') {
        ambientOsc1.frequency.linearRampToValueAtTime(62, now + 0.5);
        ambientOsc2.frequency.linearRampToValueAtTime(92.5, now + 0.5);
        ambientOsc3.frequency.linearRampToValueAtTime(123.5, now + 0.5);
        ambientFilter.frequency.linearRampToValueAtTime(800, now + 0.5);
        ambientGain.gain.linearRampToValueAtTime(0.3, now + 0.5);
    } else if (mode === 'off') {
        ambientGain.gain.linearRampToValueAtTime(0, now + 1);
    }
}

function stopAmbient() {
    if (ambientOsc1) {
        try { ambientOsc1.stop(); } catch (e) {}
        ambientOsc1 = null;
    }
    if (ambientOsc2) {
        try { ambientOsc2.stop(); } catch (e) {}
        ambientOsc2 = null;
    }
    if (ambientOsc3) {
        try { ambientOsc3.stop(); } catch (e) {}
        ambientOsc3 = null;
    }
    ambientGain = null;
    ambientFilter = null;
    currentAmbientMode = null;
}

window.initAudio = initAudio;
window.startHum = startHum;
window.stopHum = stopHum;
window.playClick = playClick;
window.playWhisper = playWhisper;
window.playKnock = playKnock;
window.playDoorClose = playDoorClose;
window.playScream = playScream;
window.playStatic = playStatic;
window.playHeartbeat = playHeartbeat;
window.stopAllAudio = stopAllAudio;
window.getAudioContextTime = window.getAudioContextTime;
window.startAmbient = startAmbient;
window.setAmbientMode = setAmbientMode;
window.stopAmbient = stopAmbient;
