import { architecturalShots, interpolateCamera, type ArchitecturalRoom, type CameraPose } from "./architecture-camera";

export const architectureMotion = {
  fadeOut: 140,
  fadeIn: 180,
  followMilliseconds: 170,
  maximumFrameDelta: 64,
  frameInterval: 1000 / 30,
  settleThreshold: .0005,
};

/** The home page stays in the atrium. Reading a card never initiates a room tour. */
export function homeCameraPose(progress: number): CameraPose {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const middle: CameraPose = { position: [.2, 5.85, 13.1], target: [-.2, 2.3, -4], fov: 55 };
  const end: CameraPose = { position: [-1.8, 6.1, 13.6], target: [-.1, 2.3, -4], fov: 55 };
  return p < .5 ? interpolateCamera(architecturalShots.forum, middle, p * 2) : interpolateCamera(middle, end, (p - .5) * 2);
}

export function homeReadingProgress(scroll: number, start: number, height: number, viewport: number) {
  return Math.max(0, Math.min(1, (scroll - start) / Math.max(1, height - viewport)));
}

/** Active-frame time only: hidden tabs, forms and slow frames cannot skip a journey. */
export class ArchitectureMotion {
  pose: CameraPose;
  phase: "idle" | "out" | "in" = "idle";
  private elapsed = 0;
  private progress = 0;
  private goal = 0;
  private compact = false;

  constructor(private room: ArchitecturalRoom, private reduced = false) {
    this.pose = architecturalShots[room];
  }

  get moving() {
    return this.phase !== "idle" || (!this.reduced && !this.compact && this.room === "forum" && Math.abs(this.goal - this.progress) > architectureMotion.settleThreshold);
  }

  setRoom(room: ArchitecturalRoom) {
    if (room === this.room) return;
    this.room = room;
    this.goal = this.progress = 0;
    this.elapsed = 0;
    // A short editorial dissolve, not a twenty-second flight through occupied rooms.
    this.phase = this.reduced ? "idle" : "out";
    if (this.reduced) this.pose = architecturalShots[room];
  }

  setProgress(progress: number) {
    this.goal = this.reduced || this.compact ? 0 : Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  }

  setReduced(reduced: boolean) {
    this.reduced = reduced;
    if (reduced) {
      this.phase = "idle";
      this.progress = this.goal = 0;
      this.pose = architecturalShots[this.room];
    }
  }

  setCompact(compact: boolean) {
    this.compact = compact;
    if (compact) {
      this.goal = this.progress = 0;
      if (this.phase === "idle") this.pose = architecturalShots[this.room];
    }
  }

  step(delta: number) {
    const dt = Math.max(0, Math.min(architectureMotion.maximumFrameDelta, Number.isFinite(delta) ? delta : 0));
    if (this.phase !== "idle") {
      this.elapsed += dt;
      if (this.phase === "out" && this.elapsed >= architectureMotion.fadeOut) {
        this.pose = architecturalShots[this.room];
        this.phase = "in";
        this.elapsed = 0;
      } else if (this.phase === "in" && this.elapsed >= architectureMotion.fadeIn) {
        this.phase = "idle";
      }
      return;
    }
    if (this.room !== "forum" || this.reduced || this.compact) return;
    this.progress += (this.goal - this.progress) * (1 - Math.exp(-dt / architectureMotion.followMilliseconds));
    if (Math.abs(this.goal - this.progress) <= architectureMotion.settleThreshold) this.progress = this.goal;
    this.pose = homeCameraPose(this.progress);
  }
}
