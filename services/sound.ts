
let audioCtx: AudioContext | null = null;
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playSound = (type: 'click' | 'message' | 'evolve' | 'genesis', muted: boolean) => {
  if (muted) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  
  switch(type) {
    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'message':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
    case 'evolve':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 2.5);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      osc.start(now);
      osc.stop(now + 2.5);
      break;
    case 'genesis':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 1.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.2);
      break;
  }
};

export const startAmbientIdle = (muted: boolean) => {
  if (muted || ambientOsc) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  ambientOsc = ctx.createOscillator();
  ambientGain = ctx.createGain();
  
  // Subtle "breathing" hum
  ambientOsc.type = 'sine';
  ambientOsc.frequency.setValueAtTime(40, ctx.currentTime);
  
  // Modulate frequency slightly for "life"
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // 0.2Hz cycle
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(5, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(ambientOsc.frequency);
  lfo.start();

  ambientGain.gain.setValueAtTime(0.015, ctx.currentTime);
  
  ambientOsc.connect(ambientGain);
  ambientGain.connect(ctx.destination);
  ambientOsc.start();
};

export const stopAmbientIdle = () => {
  if (ambientOsc) {
    ambientOsc.stop();
    ambientOsc.disconnect();
    ambientOsc = null;
  }
  if (ambientGain) {
    ambientGain.disconnect();
    ambientGain = null;
  }
};
