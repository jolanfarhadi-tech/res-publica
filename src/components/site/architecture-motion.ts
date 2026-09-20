import { architecturalShots, interpolateCamera, type ArchitecturalRoom, type CameraPose } from "./architecture-camera";

export const architectureMotion = {
  fadeOut: 140,
  fadeIn: 180,
  followMilliseconds: 600,
  dollyPeriod: 36000,
  maximumFrameDelta: 64,
  frameInterval: 1000 / 30,
  settleThreshold: .0005,
};

/** An elevated arc inside the open atrium, clear of the mezzanine rail and occupants. */
export function homeCameraPose(progress: number): CameraPose {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const middle: CameraPose = { position: [-4.2, 7.8, 11.8], target: [0, 2.3, -4], fov: 55 };
  const end: CameraPose = { position: [3.8, 7.2, 12.2], target: [0, 2.3, -4], fov: 55 };
  return p < .5 ? interpolateCamera(architecturalShots.forum, middle, p * 2) : interpolateCamera(middle, end, (p - .5) * 2);
}

export function homeReadingProgress(scroll: number, start: number, height: number, viewport: number) {
  return Math.max(0, Math.min(1, (scroll - start) / Math.max(1, height - viewport)));
}

/** Scroll and time share one camera, rather than competing animation loops. */
export function cinematicCameraPose(room: ArchitecturalRoom, progress: number, time: number, compact = false): CameraPose {
  const base = room === "forum" ? homeCameraPose(progress) : architecturalShots[room];
  const phase = time / architectureMotion.dollyPeriod * Math.PI * 2;
  // Small rooms have a strictly limited dolly; people are never the tracking target.
  const amplitude = (room === "forum" || room === "gallery" ? 1.4 : room === "editorial" || room === "review" ? .22 : .65) * (compact ? .8 : 1);
  const slide = Math.sin(phase) * amplitude;
  const push = (1 - Math.cos(phase)) * amplitude * .22;
  const reading = room === "forum" ? 0 : progress * amplitude * .5;
  return {
    position: [base.position[0] + slide, base.position[1], base.position[2] - push - reading],
    target: [base.target[0] + slide * .12, base.target[1], base.target[2]],
    fov: base.fov,
  };
}

/** Active-frame time only: hidden tabs, forms and slow frames cannot skip a journey. */
export class ArchitectureMotion {
  pose: CameraPose;
  phase: "idle" | "out" | "in" = "idle";
  private elapsed = 0;
  private progress = 0;
  private goal = 0;
  private compact = false;
  private time = 0;
  private paused = false;

  constructor(private room: ArchitecturalRoom, private reduced = false) {
    this.pose = architecturalShots[room];
  }

  get moving() {
    return !this.reduced && !this.paused;
  }

  setRoom(room: ArchitecturalRoom) {
    if (room === this.room) return;
    this.room = room;
    this.goal = this.progress = 0;
    this.elapsed = 0;
    this.time = 0;
    // A short editorial dissolve, not a twenty-second flight through occupied rooms.
    this.phase = this.reduced || this.paused ? "idle" : "out";
    if (this.reduced || this.paused) this.pose = architecturalShots[room];
  }

  setProgress(progress: number) {
    this.goal = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  }

  setReduced(reduced: boolean) {
    this.reduced = reduced;
    if (reduced) {
      if (this.phase !== "idle") this.pose = architecturalShots[this.room];
      this.phase = "idle";
      this.elapsed = 0;
    }
  }

  setCompact(compact: boolean) {
    this.compact = compact;
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused && this.phase !== "idle") {
      this.phase = "idle";
      this.pose = architecturalShots[this.room];
      this.elapsed = 0;
    }
  }

  step(delta: number) {
    if (!this.moving) return;
    const dt = Math.max(0, Math.min(architectureMotion.maximumFrameDelta, Number.isFinite(delta) ? delta : 0));
    if (this.phase !== "idle") {
      this.elapsed += dt;
      if (this.phase === "out" && this.elapsed >= architectureMotion.fadeOut) {
        this.pose = architecturalShots[this.room];
        this.phase = "in";
        this.elapsed = 0;
      } else if (this.phase === "in" && this.elapsed >= architectureMotion.fadeIn) {
        this.phase = "idle";
        this.elapsed = 0;
      }
      return;
    }
    this.time = (this.time + dt) % architectureMotion.dollyPeriod;
    this.progress += (this.goal - this.progress) * (1 - Math.exp(-dt / architectureMotion.followMilliseconds));
    if (Math.abs(this.goal - this.progress) <= architectureMotion.settleThreshold) this.progress = this.goal;
    this.pose = cinematicCameraPose(this.room, this.progress, this.time, this.compact);
  }
}
