import { architecturalShots, planCameraTravel, sampleCameraTravel, type ArchitecturalRoom, type CameraPose, type CameraTravel } from "./architecture-camera";

export const architectureMotion = {
  maximumFrameDelta: 80, frameInterval: 1000 / 30,
  scrollResponse: 480, maximumChapterStep: .025,
  ambientPeriod: 56000, ambientHorizontal: .16, ambientDepth: .08,
};

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

const chapterTravels = homeArchitecturalChapters.slice(0, -1).map((chapter, i) =>
  planCameraTravel(architecturalShots[chapter.room], architecturalShots[homeArchitecturalChapters[i + 1].room]));

/** Document-relative chapter anchors, unaffected by RTL or the browser toolbar. */
export function architecturalScrollProgress(anchors: number[], scrollY: number, viewport: number) {
  if (anchors.length < 2) return 0;
  const readingLine = Math.max(0, scrollY) + viewport * .35;
  for (let i = 0; i < anchors.length - 1; i++) {
    if (readingLine <= anchors[i + 1]) return i + Math.max(0, Math.min(1,
      (readingLine - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i])));
  }
  return anchors.length - 1;
}

function chapterPose(progress: number) {
  const index = Math.min(chapterTravels.length - 1, Math.floor(progress));
  return sampleCameraTravel(chapterTravels[index], Math.min(1, progress - index));
}

/** Active-frame time fixes the old wall-clock jumps after loading, forms or hidden tabs. */
export class ArchitectureMotion {
  pose: CameraPose;
  private travel: CameraTravel;
  private elapsed = 0;
  private paused = false;
  private ambientElapsed = 0;
  private scrollPosition: number | null = null;
  private scrollTarget = 0;

  constructor(private room: ArchitecturalRoom, private reduced = false) {
    const destination = architecturalShots[room];
    this.pose = !reduced && room === "forum"
      ? { position: [4.8, 6.65, 13.8], target: [...destination.target], fov: destination.fov }
      : destination;
    this.travel = planCameraTravel(this.pose, destination);
  }

  get moving() { return !this.reduced && !this.paused && (this.scrollPosition !== null
    ? Math.abs(this.scrollTarget - this.scrollPosition) > .0001
    : this.travel.distance > .001 && this.elapsed < this.travel.duration); }
  get animating() { return !this.reduced && !this.paused; }
  get framePose(): CameraPose {
    if (this.reduced) return this.pose;
    const angle = this.ambientElapsed / architectureMotion.ambientPeriod * Math.PI * 2;
    // Gentle architectural dolly, under 20cm: never an orbit or a portrait zoom.
    return { ...this.pose, position: [
      this.pose.position[0] + Math.sin(angle) * architectureMotion.ambientHorizontal,
      this.pose.position[1],
      this.pose.position[2] + (1 - Math.cos(angle)) * architectureMotion.ambientDepth,
    ] };
  }
  get isPaused() { return this.paused; }
  get phase() { return this.moving ? "travelling" : "idle"; }

  setRoom(room: ArchitecturalRoom) {
    if (room === this.room && this.scrollPosition === null) return;
    this.scrollPosition = null;
    this.room = room;
    const destination = architecturalShots[room];
    if (this.reduced || this.paused) this.pose = destination;
    this.travel = planCameraTravel(this.pose, destination);
    this.elapsed = 0;
  }

  setScroll(progress: number) {
    this.scrollTarget = Math.max(0, Math.min(homeArchitecturalChapters.length - 1, Number.isFinite(progress) ? progress : 0));
    if (this.scrollPosition === null) this.scrollPosition = 0;
    if (this.reduced) {
      this.scrollPosition = this.scrollTarget;
      this.pose = architecturalShots[homeArchitecturalChapters[Math.round(this.scrollTarget)].room];
    }
  }

  setReduced(reduced: boolean) {
    this.reduced = reduced;
    if (reduced) {
      this.pose = this.scrollPosition === null ? architecturalShots[this.room]
        : architecturalShots[homeArchitecturalChapters[Math.round(this.scrollTarget)].room];
      this.elapsed = this.travel.duration;
      if (this.scrollPosition !== null) this.scrollPosition = this.scrollTarget;
    }
  }

  setPaused(paused: boolean) { this.paused = paused; }

  step(delta: number) {
    if (!this.animating) return;
    const dt = Math.max(0, Math.min(architectureMotion.maximumFrameDelta, Number.isFinite(delta) ? delta : 0));
    this.ambientElapsed += dt;
    if (this.scrollPosition !== null) {
      const difference = this.scrollTarget - this.scrollPosition;
      const step = difference * (1 - Math.exp(-dt / architectureMotion.scrollResponse));
      const limit = architectureMotion.maximumChapterStep * dt / architectureMotion.frameInterval;
      this.scrollPosition += Math.max(-limit, Math.min(limit, step));
      this.pose = chapterPose(this.scrollPosition);
      return;
    }
    if (!this.moving) return;
    this.elapsed = Math.min(this.travel.duration, this.elapsed + dt);
    this.pose = sampleCameraTravel(this.travel, this.elapsed / this.travel.duration);
  }
}
