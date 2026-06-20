export type ConnectionSoundKind = "connect" | "disconnect";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;

  if (!audioCtx) {
    audioCtx = new Ctx();
  }

  return audioCtx;
}

/** Resume AudioContext after a user gesture (toggle click). */
export async function prepareConnectionAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      // Ignore — playback will no-op if context stays suspended.
    }
  }
}

export async function playConnectionSound(kind: ConnectionSoundKind): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }

  if (ctx.state !== "running") return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;

  if (kind === "connect") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.5);
    return;
  }

  osc.type = "triangle";
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  osc.start(now);
  osc.stop(now + 0.4);
}
