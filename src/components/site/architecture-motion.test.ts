import { describe, expect, it } from "vitest";
import { architecturalShots } from "./architecture-camera";
import { ArchitectureMotion, architecturalScrollProgress, homeArchitecturalChapters, roomScrollPose } from "./architecture-motion";

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
  it("keeps a tiny autonomous dolly inside the authored building, without orbiting or zooming", () => {
    const motion = new ArchitectureMotion("studio");
    const start = motion.framePose;
    advance(motion, 250);
    expect(distance(start.position, motion.framePose.position)).toBeGreaterThan(.05);
    expect(distance(architecturalShots.studio.position, motion.framePose.position)).toBeLessThan(.45);
    expect(motion.framePose.fov).toBe(start.fov);
    motion.setPaused(true);
    const paused = motion.framePose;
    advance(motion);
    expect(motion.framePose).toEqual(paused);
    motion.setReduced(true);
    expect(motion.framePose).toEqual(architecturalShots.studio);
    expect(motion.animating).toBe(false);
  });
  it("maps forward and reverse scrolling continuously to the same authored path", () => {
    const motion = new ArchitectureMotion("forum");
    motion.setScroll(1.5);
    advance(motion);
    const middle = motion.pose;
    motion.setScroll(2);
    advance(motion);
    expect(distance(motion.pose.position, architecturalShots.review.position)).toBeLessThan(.01);
    motion.setScroll(1.5);
    advance(motion);
    expect(distance(motion.pose.position, middle.position)).toBeLessThan(.01);
    expect(motion.pose.position[0]).toBeGreaterThan(-18);
    expect(motion.pose.position[0]).toBeLessThan(18);
    expect(motion.pose.target[1]).toBeLessThan(motion.pose.position[1]);
  });
  it("limits scroll jumps and respects reduced motion and pause", () => {
    const motion = new ArchitectureMotion("forum");
    motion.setScroll(0);
    advance(motion);
    motion.setScroll(6);
    const before = motion.pose;
    motion.step(60000);
    expect(distance(before.position, motion.pose.position)).toBeLessThan(.5);
    motion.setPaused(true);
    const paused = motion.framePose;
    motion.setScroll(3);
    advance(motion);
    expect(motion.framePose).toEqual(paused);
    motion.setReduced(true);
    motion.setScroll(3.2);
    expect(motion.framePose).toEqual(architecturalShots.learning);
    expect(motion.animating).toBe(false);
  });
  it("uses bounded document anchors instead of a delayed chapter timer", () => {
    expect(architecturalScrollProgress([350, 1350, 2350], 0, 1000)).toBe(0);
    expect(architecturalScrollProgress([350, 1350, 2350], 500, 1000)).toBe(.5);
    expect(architecturalScrollProgress([350, 1350, 2350], 1000, 1000)).toBe(1);
    expect(architecturalScrollProgress([350, 1350, 2350], 50000, 1000)).toBe(2);
  });
  it.each(Object.keys(architecturalShots) as (keyof typeof architecturalShots)[])("moves %s with page scroll, staying inside its own room", room => {
    const motion = new ArchitectureMotion(room);
    motion.setRoomScroll(0); advance(motion);
    const first = motion.pose;
    motion.setRoomScroll(1); advance(motion);
    expect(distance(first.position, motion.pose.position)).toBeGreaterThan(1);
    expect(motion.pose.position[1]).toBe(first.position[1]);
    expect(motion.pose.fov).toBe(first.fov);
    expect(distance(motion.pose.position, roomScrollPose(room, 1).position)).toBeLessThan(.001);
    motion.setRoomScroll(0); advance(motion);
    expect(distance(motion.pose.position, first.position)).toBeLessThan(.001);
    motion.setReduced(true); motion.setRoomScroll(1); advance(motion);
    expect(motion.framePose).toEqual(architecturalShots[room]);
  });
  it("preserves touch momentum on reversal and gives equivalent 30/60/120Hz poses", () => {
    const poses = [30, 60, 120].map(fps => {
      const motion = new ArchitectureMotion("learning"); motion.setRoomScroll(.7);
      for (let i = 0; i < fps * 2; i++) motion.step(1000 / fps);
      const before = motion.pose.position;
      motion.setRoomScroll(0); motion.step(1000 / fps);
      expect(distance(before, motion.pose.position)).toBeLessThan(.1);
      return before;
    });
    expect(distance(poses[0], poses[2])).toBeLessThan(.035);
  });
});
