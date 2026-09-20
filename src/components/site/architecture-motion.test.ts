import { describe, expect, it } from "vitest";
import { architecturalShots, type ArchitecturalRoom } from "./architecture-camera";
import { ArchitectureMotion, cinematicCameraPose, homeCameraPose, homeReadingProgress } from "./architecture-motion";

function advance(motion: ArchitectureMotion, frames = 150) { for (let i = 0; i < frames; i++) motion.step(1000 / 30); }
const distance = (a: number[], b: number[]) => Math.hypot(...a.map((v, i) => v - b[i]));

describe("continuous architectural camera", () => {
  it.each(Object.keys(architecturalShots) as ArchitecturalRoom[])("visibly moves in %s without scrolling, on desktop and phone", (room) => {
    for (const compact of [false, true]) {
      const motion = new ArchitectureMotion(room);
      motion.setCompact(compact);
      const start = motion.pose.position;
      advance(motion);
      expect(distance(motion.pose.position, start)).toBeGreaterThan(.12);
      expect(motion.moving).toBe(true);
    }
  });
  it("keeps the atrium dolly clear of floor, rails and occupied seating", () => {
    for (let p = 0; p <= 1; p += .02) for (let t = 0; t <= 36000; t += 500) {
      const { position, fov } = cinematicCameraPose("forum", p, t);
      expect(Math.abs(position[0])).toBeLessThan(6);
      expect(position[1]).toBeGreaterThanOrEqual(6.15);
      expect(position[1]).toBeLessThanOrEqual(7.8);
      expect(position[2]).toBeGreaterThan(11);
      expect(position[2]).toBeLessThan(14);
      expect(fov).toBe(55);
    }
  });
  it("reframes by metres after one screenful on a long mobile page", () => {
    const motion = new ArchitectureMotion("forum");
    motion.setCompact(true);
    motion.setProgress(homeReadingProgress(844, 0, 844 * 5, 844));
    advance(motion, 60);
    expect(distance(motion.pose.position, architecturalShots.forum.position)).toBeGreaterThan(2);
  });
  it("freezes exactly when paused, resumes gently, and respects reduced motion", () => {
    const motion = new ArchitectureMotion("forum");
    advance(motion);
    motion.setPaused(true);
    const paused = motion.pose;
    motion.setProgress(1);
    advance(motion);
    expect(motion.pose).toEqual(paused);
    expect(motion.moving).toBe(false);
    motion.setPaused(false);
    motion.step(32);
    expect(distance(motion.pose.position, paused.position)).toBeLessThan(.5);
    motion.setReduced(true);
    const reduced = motion.pose;
    advance(motion);
    expect(motion.pose).toEqual(reduced);
    expect(motion.moving).toBe(false);
    motion.setRoom("learning");
    expect(motion.phase).toBe("idle");
    expect(motion.pose).toEqual(architecturalShots.learning);
  });
  it("bounds stalled frames and resolves rapid navigation without crossing walls", () => {
    const motion = new ArchitectureMotion("forum");
    motion.step(60000);
    expect(distance(motion.pose.position, architecturalShots.forum.position)).toBeLessThan(.1);
    motion.setRoom("studio");
    motion.setRoom("editorial");
    expect(motion.phase).toBe("out");
    advance(motion, 11);
    expect(motion.phase).toBe("idle");
    expect(motion.pose).toEqual(architecturalShots.editorial);
    advance(motion);
    expect(distance(motion.pose.position, architecturalShots.editorial.position)).toBeLessThan(.3);
  });
  it("has a seamless closed dolly and clamps invalid input", () => {
    for (const room of Object.keys(architecturalShots) as ArchitecturalRoom[]) {
      const start = cinematicCameraPose(room, 0, 0), end = cinematicCameraPose(room, 0, 36000);
      expect(distance(start.position, end.position)).toBeLessThan(.00001);
    }
    expect(homeCameraPose(NaN)).toEqual(architecturalShots.forum);
    expect(homeReadingProgress(-10, 0, 4000, 800)).toBe(0);
    expect(homeReadingProgress(1600, 0, 4000, 800)).toBe(.5);
    expect(homeReadingProgress(10000, 0, 4000, 800)).toBe(1);
  });
});
