import { useCallback, useEffect, useRef } from 'react';
import type { Outcome } from '../../engine/types';

export type SoundCue = 'place' | 'win' | 'lose' | 'draw';

interface ToneSpec {
  readonly freq: number;
  readonly duration: number;
  readonly type: OscillatorType;
  readonly gain: number;
  readonly delay?: number;
}

// Tiny synthesised cues — no external assets. Win/lose are short arpeggios.
const CUES: Record<SoundCue, readonly ToneSpec[]> = {
  place: [{ freq: 440, duration: 0.07, type: 'sine', gain: 0.12 }],
  win: [
    { freq: 523.25, duration: 0.12, type: 'triangle', gain: 0.14 },
    { freq: 659.25, duration: 0.12, type: 'triangle', gain: 0.14, delay: 0.1 },
    { freq: 783.99, duration: 0.18, type: 'triangle', gain: 0.14, delay: 0.2 },
  ],
  lose: [
    { freq: 311.13, duration: 0.16, type: 'sine', gain: 0.13 },
    { freq: 233.08, duration: 0.24, type: 'sine', gain: 0.13, delay: 0.12 },
  ],
  draw: [
    { freq: 392, duration: 0.14, type: 'sine', gain: 0.1 },
    { freq: 392, duration: 0.14, type: 'sine', gain: 0.1, delay: 0.14 },
  ],
};

type WindowWithAudio = typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

/**
 * Subtle WebAudio blips, gated behind a single `enabled` flag (off by default).
 * The AudioContext is created lazily and `resume()`d inside the first play call
 * — which always follows a user gesture — so browsers don't keep it suspended.
 */
export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
    },
    [],
  );

  const play = useCallback(
    (cue: SoundCue) => {
      if (!enabled) return;
      const Ctor =
        window.AudioContext ?? (window as WindowWithAudio).webkitAudioContext;
      if (!Ctor) return;
      try {
        const ctx = ctxRef.current ?? (ctxRef.current = new Ctor());
        if (ctx.state === 'suspended') void ctx.resume();
        const now = ctx.currentTime;
        for (const tone of CUES[cue]) {
          const start = now + (tone.delay ?? 0);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = tone.type;
          osc.frequency.value = tone.freq;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(tone.gain, start + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
          osc.connect(gain).connect(ctx.destination);
          osc.start(start);
          osc.stop(start + tone.duration + 0.02);
        }
      } catch {
        // Audio is a non-critical enhancement; never let it break the UI.
      }
    },
    [enabled],
  );

  const playOutcome = useCallback(
    (outcome: Outcome, humanLost: boolean) => {
      if (outcome === 'draw') play('draw');
      else play(humanLost ? 'lose' : 'win');
    },
    [play],
  );

  return { play, playOutcome };
}
