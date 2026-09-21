/** Measure actual frame cadence, not CPU-core count, before reducing GPU work. */
export class CinematicQuality {
  level = 2;
  private samples = 0;
  private elapsed = 0;
  frameMs = 1000 / 60;
  record(delta: number) {
    if (!Number.isFinite(delta) || delta <= 0 || delta > 150) return false;
    this.elapsed += delta; this.samples++;
    if (this.samples < 90) return false;
    this.frameMs = this.elapsed / this.samples;
    this.elapsed = 0; this.samples = 0;
    if (this.level > 0 && this.frameMs > (this.level === 2 ? 25 : 34)) { this.level--; return true; }
    return false;
  }
  resetSamples() { this.samples = 0; this.elapsed = 0; }
}

export function architecturalPixelRatio(width: number, height: number, dpr: number, level: number) {
  const compact = width < 768;
  const budget = (compact ? 450_000 : 1_300_000) * (level === 0 ? .64 : 1);
  return Math.min(dpr || 1, compact ? 1 : 1.25, Math.sqrt(budget / Math.max(1, width * height)));
}
