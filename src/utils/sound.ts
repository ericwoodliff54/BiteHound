// Audio Feedback Synthesizer using Web Audio API

class SoundEngine {
  enabled: boolean = true;
  ctx: AudioContext | null = null;

  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, delay = 0) {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  }

  playScanBeep() {
    try {
      this.playTone(880, 'sine', 0.08);
    } catch {}
  }

  playClearChime() {
    try {
      this.playTone(523.25, 'triangle', 0.15, 0);
      this.playTone(659.25, 'triangle', 0.25, 0.12);
    } catch {}
  }

  playWarningBuzz() {
    try {
      this.playTone(280, 'sawtooth', 0.25, 0);
      this.playTone(220, 'sawtooth', 0.35, 0.2);
    } catch {}
  }

  playAlertSiren() {
    try {
      this.playTone(380, 'sawtooth', 0.22, 0);
      this.playTone(260, 'sawtooth', 0.32, 0.18);
    } catch {}
  }

  playAllergenAlert() {
    try {
      this.playTone(440, 'square', 0.15, 0);
      this.playTone(349.23, 'square', 0.25, 0.15);
    } catch {}
  }
}

export const sound = new SoundEngine();

export function playScanBeep(muted = false) {
  if (muted) return;
  sound.playScanBeep();
}

export function playClearChime(muted = false) {
  if (muted) return;
  sound.playClearChime();
}

export function playWarningBuzz(muted = false) {
  if (muted) return;
  sound.playWarningBuzz();
}

export function playAlertSiren(muted = false) {
  if (muted) return;
  sound.playAlertSiren();
}

export function playAllergenAlert(muted = false) {
  if (muted) return;
  sound.playAllergenAlert();
}

export function triggerHaptic(typeOrPattern: 'light' | 'medium' | 'heavy' | number[] = 'light') {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (Array.isArray(typeOrPattern)) {
        navigator.vibrate(typeOrPattern);
      } else if (typeOrPattern === 'heavy') {
        navigator.vibrate([150, 80, 150, 80, 200]);
      } else if (typeOrPattern === 'medium') {
        navigator.vibrate([80, 50, 80]);
      } else {
        navigator.vibrate(50);
      }
    }
  } catch {}
}
