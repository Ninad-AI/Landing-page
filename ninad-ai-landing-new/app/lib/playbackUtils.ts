/**
 * Raw linear16 PCM playback at 16000 Hz via Web Audio API.
 *
 * The browser cannot play raw PCM via <audio> — this module provides
 * the mandatory Web Audio API equivalent.
 *
 * Usage:
 *   import { playRawPcm16 } from "@/lib/playbackUtils";
 *   playRawPcm16(arrayBuffer);                        // one-shot
 *   playRawPcm16(arrayBuffer, audioContext);           // shared context
 *   playRawPcm16(arrayBuffer, audioContext, destination); // custom destination
 */

/**
 * Convert an Int16Array (raw linear16 PCM) to Float32Array (Web Audio samples).
 * Values are normalised from [-32768, 32767] → [-1, 1].
 */
export function decodePcm16ToFloat32(i16: Int16Array): Float32Array {
  const len = i16.length;
  const f32 = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const s = i16[i];
    f32[i] = s < 0 ? s / 0x8000 : s / 0x7fff;
  }
  return f32;
}

let sharedCtx: AudioContext | null = null;

/**
 * Get (or create) a shared AudioContext locked to 16000 Hz.
 * Resumes if suspended (browser autoplay policy).
 */
export function getSharedAudioContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === "closed") {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedCtx = new Ctor({ sampleRate: 16000 });
  }
  if (sharedCtx.state === "suspended") {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

/**
 * Play a single raw PCM16 chunk at 16000 Hz.
 *
 * @param arrayBuffer - Raw linear16 PCM data (Int16 bytes, 16000 Hz, mono).
 * @param audioContext - Optional; uses shared context if omitted.
 * @param destination - Optional; defaults to ctx.destination.
 * @returns The AudioBufferSourceNode (useful for tracking/stopping).
 */
export function playRawPcm16(
  arrayBuffer: ArrayBuffer,
  audioContext?: AudioContext,
  destination?: AudioNode,
): AudioBufferSourceNode {
  const ctx = audioContext ?? getSharedAudioContext();
  const dest = destination ?? ctx.destination;
  const i16 = new Int16Array(arrayBuffer);
  const f32 = decodePcm16ToFloat32(i16);
  const audioBuffer = ctx.createBuffer(1, f32.length, 16000);
  audioBuffer.copyToChannel(f32 as Float32Array<ArrayBuffer>, 0, 0);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(dest);
  source.start();
  return source;
}

/**
 * Queue-based PCM16 player for streaming scenarios.
 * Buffers are played sequentially without gaps.
 *
 * Usage:
 *   const player = new Pcm16Player();
 *   player.enqueue(arrayBuffer1);
 *   player.enqueue(arrayBuffer2);
 *   player.stop();
 */
export class Pcm16Player {
  private ctx: AudioContext;
  private queue: AudioBuffer[] = [];
  private playing = false;
  private playHead = 0;
  private sourceNodes: AudioBufferSourceNode[] = [];
  private onEndCallbacks: Array<() => void> = [];

  constructor(ctx?: AudioContext) {
    this.ctx = ctx ?? getSharedAudioContext();
  }

  enqueue(arrayBuffer: ArrayBuffer): void {
    const i16 = new Int16Array(arrayBuffer);
    const f32 = decodePcm16ToFloat32(i16);
    const audioBuffer = this.ctx.createBuffer(1, f32.length, 16000);
    audioBuffer.copyToChannel(f32 as Float32Array<ArrayBuffer>, 0, 0);
    this.queue.push(audioBuffer);
    if (!this.playing) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.queue.length === 0) {
      this.playing = false;
      return;
    }
    this.playing = true;
    const buffer = this.queue.shift()!;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    this.sourceNodes.push(source);

    if (this.playHead < this.ctx.currentTime) {
      this.playHead = this.ctx.currentTime;
    }
    source.start(this.playHead);
    this.playHead += buffer.duration;

    source.onended = () => {
      this.sourceNodes = this.sourceNodes.filter((n) => n !== source);
      this.flush();
    };
  }

  stop(): void {
    this.queue = [];
    this.playing = false;
    this.sourceNodes.forEach((n) => {
      try { n.stop(); } catch { /* already stopped */ }
    });
    this.sourceNodes = [];
    this.playHead = 0;
  }

  get isPlaying(): boolean {
    return this.playing || this.sourceNodes.length > 0;
  }
}

/**
 * Buffered playout for streaming PCM16 audio with gap protection.
 *
 * - Accumulates at least 200 ms of audio before starting playback
 *   (gives the network a head start to fill the pipeline).
 * - Applies a 3 ms fade-in on any buffer that would start after a gap,
 *   masking the click/pop that would otherwise occur.
 * - Returns a per-chunk Promise so callers can snapshot pending segments
 *   and know when the entire utterance has drained.
 */
export class PlayoutBuffer {
  private ctx: AudioContext;
  private queue: AudioBuffer[] = [];
  private playHead = 0;
  private started = false;
  private readonly minBufferSeconds: number;
  private readonly crossfadeSeconds: number;
  private scheduledSources: AudioBufferSourceNode[] = [];
  private pendingResolves: Array<() => void> = [];

  constructor(ctx: AudioContext, minBufferMs = 200, crossfadeMs = 3) {
    this.ctx = ctx;
    this.minBufferSeconds = minBufferMs / 1000;
    this.crossfadeSeconds = crossfadeMs / 1000;
    this.playHead = ctx.currentTime;
  }

  /**
   * Feed a decoded AudioBuffer into the playout queue.
   * Returns a Promise that resolves when this chunk has finished playing.
   */
  enqueue(buf: AudioBuffer): Promise<void> {
    const p = new Promise<void>((resolve) => {
      this.pendingResolves.push(resolve);
    });

    if (!this.started) {
      this.queue.push(buf);
      const buffered = this.queue.reduce((s, b) => s + b.duration, 0);
      if (buffered >= this.minBufferSeconds) {
        this.flush();
      }
      return p;
    }

    this.schedule(buf);
    return p;
  }

  private flush(): void {
    this.started = true;
    this.playHead = Math.max(this.ctx.currentTime, this.playHead);
    for (const buf of this.queue) {
      this.schedule(buf);
    }
    this.queue = [];
  }

  private schedule(buf: AudioBuffer): void {
    const now = this.ctx.currentTime;
    const gap = now - this.playHead;

    if (gap > 0.001) {
      this.playHead = now;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.playHead);
      gain.gain.linearRampToValueAtTime(1, this.playHead + this.crossfadeSeconds);
      src.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(this.playHead);
      this.playHead += buf.duration;
      this.trackSource(src);
    } else {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.ctx.destination);
      src.start(this.playHead);
      this.playHead += buf.duration;
      this.trackSource(src);
    }
  }

  private trackSource(src: AudioBufferSourceNode): void {
    this.scheduledSources.push(src);
    const resolve = this.pendingResolves.shift();
    src.onended = () => {
      this.scheduledSources = this.scheduledSources.filter((n) => n !== src);
      resolve?.();
    };
  }

  get isPlaying(): boolean {
    return this.scheduledSources.length > 0 || this.queue.length > 0;
  }

  stop(): void {
    this.queue = [];
    this.started = false;
    this.scheduledSources.forEach((n) => {
      try { n.stop(); } catch { /* already stopped */ }
    });
    this.scheduledSources = [];
    const resolves = this.pendingResolves;
    this.pendingResolves = [];
    resolves.forEach((r) => r());
    this.playHead = this.ctx.currentTime;
  }
}
