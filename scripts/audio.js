// ============================================
// scripts/audio.js — Web Audio API генератор звуков
// ============================================

let audioCtx = null;
let masterGain = null;
let humOscillator = null;
let humGain = null;
let humOscillator2 = null;
let lastWhisperTime = 0;
let lastClickTime = 0;

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
    if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
        audioCtx = null;
    }
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
