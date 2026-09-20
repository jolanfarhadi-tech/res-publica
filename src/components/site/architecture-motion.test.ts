import { describe, expect, it } from "vitest";
import { architecturalShots } from "./architecture-camera";
import { ArchitectureMotion, homeCameraPose, homeReadingProgress } from "./architecture-motion";

describe("reading-led architectural motion", () => {
  it("keeps every home pose in the same safe gallery framing", () => {
    for (let i = 0; i <= 100; i++) {
      const pose = homeCameraPose(i / 100);
      expect(pose.position[0]).toBeGreaterThanOrEqual(-1.8);
      expect(pose.position[0]).toBeLessThanOrEqual(2.4);
      expect(pose.position[1]).toBeGreaterThanOrEqual(5.8);
      expect(pose.position[2]).toBeGreaterThanOrEqual(13);
      expect(pose.fov).toBe(55);
    }
  });
  it("follows scrolling promptly, settles and reverses without restarting a tour", () => {
    const motion = new ArchitectureMotion("forum");
    motion.setProgress(1);
    motion.step(32);
    expect(motion.pose.position[0]).toBeLessThan(2.4);
    for (let i = 0; i < 45; i++) motion.step(32);
    expect(motion.moving).toBe(false);
    expect(motion.pose).toEqual(homeCameraPose(1));
    motion.setProgress(0);
    motion.step(32);
    expect(motion.pose.position[0]).toBeGreaterThan(-1.8);
  });
  it("changes rooms behind a bounded dissolve, not through floors or furniture", () => {
    const motion = new ArchitectureMotion("forum");
    motion.setRoom("studio");
    expect(motion.phase).toBe("out");
    expect(motion.pose).toEqual(architecturalShots.forum);
    for (let i = 0; i < 5; i++) motion.step(32);
    expect(motion.phase).toBe("in");
    expect(motion.pose).toEqual(architecturalShots.studio);
    for (let i = 0; i < 6; i++) motion.step(32);
    expect(motion.moving).toBe(false);
  });
  it("does not jump after a stalled frame and resolves rapid navigation to the latest room", () => {
    const motion = new ArchitectureMotion("forum");
    motion.setRoom("studio");
    motion.step(60000);
    expect(motion.phase).toBe("out");
    motion.setRoom("editorial");
    for (let i = 0; i < 12; i++) motion.step(32);
    expect(motion.pose).toEqual(architecturalShots.editorial);
    expect(motion.moving).toBe(false);
  });
  it("keeps mobile framing stable and honors reduced motion", () => {
    const motion = new ArchitectureMotion("forum");
    motion.setCompact(true);
    motion.setProgress(1);
    motion.step(64);
    expect(motion.moving).toBe(false);
    expect(motion.pose).toEqual(architecturalShots.forum);
    motion.setReduced(true);
    motion.setRoom("learning");
    expect(motion.phase).toBe("idle");
    expect(motion.pose).toEqual(architecturalShots.learning);
  });
  it("normalizes actual reading extent, including restored scroll positions", () => {
    expect(homeReadingProgress(-10, 0, 4000, 800)).toBe(0);
    expect(homeReadingProgress(1600, 0, 4000, 800)).toBe(.5);
    expect(homeReadingProgress(10000, 0, 4000, 800)).toBe(1);
    expect(homeReadingProgress(0, 0, 0, 0)).toBe(0);
  });
});
