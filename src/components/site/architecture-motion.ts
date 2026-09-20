import { architecturalShots, planCameraTravel, sampleCameraTravel, type ArchitecturalRoom, type CameraPose, type CameraTravel } from "./architecture-camera";

export const architectureMotion = { maximumFrameDelta: 80, frameInterval: 1000 / 30, readingDebounce: 180 };

/** The approved release's room-to-room journey, with a distinct view for each chapter. */
export const homeArchitecturalChapters: { selector: string; room: ArchitecturalRoom }[] = [
  { selector: ".home-hero", room: "forum" },
  { selector: ".home-section--gateways", room: "studio" },
  { selector: ".home-section--journey", room: "review" },
  { selector: ".ecosystem-field", room: "learning" },
  { selector: ".home-section--team", room: "gallery" },
  { selector: ".home-section--latest", room: "editorial" },
  { selector: ".home-close", room: "library" },
];

/** Active-frame time fixes the old wall-clock jumps after loading, forms or hidden tabs. */
export class ArchitectureMotion {
  pose: CameraPose;
  private travel: CameraTravel;
  private elapsed = 0;
  private paused = false;

  constructor(private room: ArchitecturalRoom, private reduced = false) {
    const destination = architecturalShots[room];
    this.pose = !reduced && room === "forum"
      ? { position: [4.8, 6.65, 13.8], target: [...destination.target], fov: destination.fov }
      : destination;
    this.travel = planCameraTravel(this.pose, destination);
  }

  get moving() { return !this.reduced && !this.paused && this.travel.distance > .001 && this.elapsed < this.travel.duration; }
  get isPaused() { return this.paused; }
  get phase() { return this.moving ? "travelling" : "idle"; }

  setRoom(room: ArchitecturalRoom) {
    if (room === this.room) return;
    this.room = room;
    const destination = architecturalShots[room];
    if (this.reduced || this.paused) this.pose = destination;
    this.travel = planCameraTravel(this.pose, destination);
    this.elapsed = 0;
  }

  setReduced(reduced: boolean) {
    this.reduced = reduced;
    if (reduced) {
      this.pose = architecturalShots[this.room];
      this.elapsed = this.travel.duration;
    }
  }

  setPaused(paused: boolean) { this.paused = paused; }

  step(delta: number) {
    if (!this.moving) return;
    const dt = Math.max(0, Math.min(architectureMotion.maximumFrameDelta, Number.isFinite(delta) ? delta : 0));
    this.elapsed = Math.min(this.travel.duration, this.elapsed + dt);
    this.pose = sampleCameraTravel(this.travel, this.elapsed / this.travel.duration);
  }
}
