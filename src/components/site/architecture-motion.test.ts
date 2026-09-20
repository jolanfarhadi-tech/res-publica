import { describe, expect, it } from "vitest";
import { architecturalShots } from "./architecture-camera";
import { ArchitectureMotion, homeArchitecturalChapters } from "./architecture-motion";

function advance(motion: ArchitectureMotion, frames = 1000) { for (let i = 0; i < frames; i++) motion.step(32); }
const distance = (a: number[], b: number[]) => Math.hypot(...a.map((v, i) => v - b[i]));

describe("approved release room-to-room journey", () => {
  it("provides seven distinct home scenes rather than an endlessly repeating atrium orbit", () => {
    expect(homeArchitecturalChapters).toHaveLength(7);
    expect(new Set(homeArchitecturalChapters.map(chapter => chapter.room)).size).toBe(7);
    expect(homeArchitecturalChapters[0].room).toBe("forum");
  });
  it("opens with a bounded establishing move and settles without a perpetual idle loop", () => {
    const motion = new ArchitectureMotion("forum");
    const start = motion.pose;
    advance(motion, 50);
    expect(distance(motion.pose.position, start.position)).toBeGreaterThan(.8);
    advance(motion);
    expect(motion.pose).toEqual(architecturalShots.forum);
    expect(motion.moving).toBe(false);
  });
  it("travels through every chapter without dissolving or teleporting", () => {
    const motion = new ArchitectureMotion("forum");
    advance(motion);
    for (const { room } of homeArchitecturalChapters.slice(1)) {
      const before = motion.pose;
      motion.setRoom(room);
      expect(motion.pose).toEqual(before);
      expect(motion.phase).toBe("travelling");
      advance(motion);
      expect(motion.pose).toEqual(architecturalShots[room]);
      expect(motion.moving).toBe(false);
    }
  });
  it("redirects a rapid scroll from the current position without jumping to an old waypoint", () => {
    const motion = new ArchitectureMotion("forum");
    motion.setRoom("studio");
    advance(motion, 40);
    const before = motion.pose;
    motion.setRoom("editorial");
    expect(motion.pose).toEqual(before);
    advance(motion);
    expect(motion.pose).toEqual(architecturalShots.editorial);
  });
  it("freezes and resumes the same journey, and lets reduced motion override it", () => {
    const motion = new ArchitectureMotion("forum");
    motion.setRoom("studio");
    advance(motion, 40);
    motion.setPaused(true);
    const before = motion.pose;
    advance(motion);
    expect(motion.pose).toEqual(before);
    motion.setPaused(false);
    motion.step(32);
    expect(distance(motion.pose.position, before.position)).toBeLessThan(.5);
    motion.setReduced(true);
    motion.setRoom("learning");
    expect(motion.pose).toEqual(architecturalShots.learning);
    expect(motion.moving).toBe(false);
  });
  it("caps a stalled frame instead of skipping an entire journey", () => {
    const motion = new ArchitectureMotion("forum");
    const before = motion.pose;
    motion.step(60000);
    expect(distance(motion.pose.position, before.position)).toBeLessThan(.01);
    expect(motion.moving).toBe(true);
  });
});
