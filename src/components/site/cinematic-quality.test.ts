import { describe, expect, it } from "vitest";
import { architecturalPixelRatio, CinematicQuality } from "./cinematic-quality";

describe("adaptive architectural frame budget", () => {
  it("keeps detail at 60fps but removes extra GPU passes on sustained slow frames", () => {
    const quality = new CinematicQuality();
    for (let i = 0; i < 90; i++) quality.record(16.67);
    expect(quality.level).toBe(2);
    for (let i = 0; i < 90; i++) quality.record(30);
    expect(quality.level).toBe(1);
    for (let i = 0; i < 90; i++) quality.record(40);
    expect(quality.level).toBe(0);
    for (let i = 0; i < 90; i++) quality.record(16.67);
    expect(quality.level).toBe(0); // no resolution/effect oscillation while scrolling
  });
  it("does not interpret hidden-tab stalls as mobile GPU pressure", () => {
    const quality = new CinematicQuality();
    for (let i = 0; i < 100; i++) quality.record(1000);
    expect(quality.level).toBe(2);
    for (let i = 0; i < 89; i++) quality.record(60);
    quality.resetSamples(); quality.record(16);
    expect(quality.level).toBe(2);
  });
  it.each([[390,844,3],[1440,900,2],[2560,1440,2]])("bounds the actual GPU pixel count at %sx%s", (width,height,dpr) => {
    const ratio = architecturalPixelRatio(width,height,dpr,2);
    expect(width*height*ratio*ratio).toBeLessThanOrEqual(1_300_001);
    expect(architecturalPixelRatio(width,height,dpr,0)).toBeLessThanOrEqual(ratio);
  });
});
