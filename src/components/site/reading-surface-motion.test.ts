import { describe, expect, it } from "vitest";
import { readingSurfaceOffset } from "./reading-surface-motion";

describe("reading surface depth response", () => {
  it("never exceeds 12 pixels and ignores offscreen panels", () => {
    for (let top = -1500; top < 1500; top += 5) expect(Math.abs(readingSurfaceOffset(top, 400, 800))).toBeLessThanOrEqual(12);
    expect(readingSurfaceOffset(850, 300, 800)).toBe(0);
    expect(readingSurfaceOffset(-500, 300, 800)).toBe(0);
    expect(readingSurfaceOffset(0, 300, 0)).toBe(0);
  });
  it("settles at the reading center without reordering or horizontal displacement", () => {
    expect(readingSurfaceOffset(200, 400, 800)).toBe(0);
    expect(readingSurfaceOffset(300, 400, 800)).toBe(1.5);
    expect(readingSurfaceOffset(100, 400, 800)).toBe(-1.5);
  });
});
