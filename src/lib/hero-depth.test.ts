import { describe, expect, it } from "vitest";
import { getHeroPose, neutralHeroPose } from "./hero-depth";

const bounds = { left: 100, top: 200, width: 400, height: 300 };

describe("hero depth interaction", () => {
  it("rests at the neutral pose in the visual centre", () => {
    expect(getHeroPose(300, 350, bounds)).toEqual(neutralHeroPose);
  });

  it("gives foreground depth a restrained, directionally correct response", () => {
    expect(getHeroPose(500, 200, bounds)).toEqual({
      rotateX: 2.2,
      rotateY: 3.2,
      lightX: 18,
      lightY: -10,
    });
  });

  it("clamps off-scene pointers and avoids invalid transforms on empty bounds", () => {
    expect(getHeroPose(900, 900, bounds)).toEqual({
      rotateX: -2.2,
      rotateY: 3.2,
      lightX: 18,
      lightY: 10,
    });
    expect(getHeroPose(100, 200, { ...bounds, width: 0 })).toEqual(neutralHeroPose);
  });
});
