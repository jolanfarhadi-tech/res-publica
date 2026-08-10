import { describe, expect, it } from "vitest";
import { isFellowshipCandidacyFinal, mayEnterFellowshipReview, mayTransitionFellowshipRecord } from "./workflow";

describe("Fellowship human-gated workflow", () => {
  it("admits only open candidacies to review", () => {
    expect(mayEnterFellowshipReview("submitted")).toBe(true);
    expect(mayEnterFellowshipReview("more-information-required")).toBe(true);
    expect(mayEnterFellowshipReview("approved")).toBe(false);
  });

  it("keeps record changes explicit and reversible only before ending", () => {
    expect(mayTransitionFellowshipRecord("active", "suspended")).toBe(true);
    expect(mayTransitionFellowshipRecord("suspended", "active")).toBe(true);
    expect(mayTransitionFellowshipRecord("ended", "active")).toBe(false);
    expect(isFellowshipCandidacyFinal("rejected")).toBe(true);
  });
});
