// ============================================
// scripts/audio.js — Web Audio API генератор звуков
// ============================================

let audioCtx = null;
let masterGain = null;
let humOscillator = null;
let humGain = null;
let humOscillator2 = null;

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
    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 800;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playWhisper() {
    if (!audioCtx) return;
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.6);
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
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    shum.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    shum.start();
    shum.stop(audioCtx.currentTime + 0.6);
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
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.4);
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
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

    shum.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    shum.start();
    shum.stop(audioCtx.currentTime + 0.4);

    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 80;
    const gain2 = audioCtx.createGain();
    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain2);
    gain2.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

function playScream() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(3000, audioCtx.currentTime + 1.0);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);

    const bufferSize = Math.floor(audioCtx.sampleRate * 1.2);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const shum = audioCtx.createBufferSource();
    shum.buffer = buffer;
    const shumGain = audioCtx.createGain();
    shumGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    shumGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

    shum.connect(shumGain);
    shumGain.connect(masterGain);
    shum.start();
    shum.stop(audioCtx.currentTime + 1.2);
}

function playStatic(intensity) {
    if (!audioCtx) return;
    if (intensity < 0.05) return;

    if (!GameState.staticCacheBuffer) {
        const bufferSize = Math.floor(audioCtx.sampleRate * 0.1);
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        GameState.staticCacheBuffer = buffer;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = GameState.staticCacheBuffer;
    source.loop = true;

    const gain = audioCtx.createGain();
    gain.gain.value = intensity * 0.15;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start();
    setTimeout(() => {
        try { source.stop(); } catch (e) {}
    }, 150);
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
