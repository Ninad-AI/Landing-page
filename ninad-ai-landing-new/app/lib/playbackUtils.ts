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
