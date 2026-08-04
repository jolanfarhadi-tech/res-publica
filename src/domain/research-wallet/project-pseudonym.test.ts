import { describe, expect, it } from "vitest";
import { deriveProjectPseudonym } from "./project-pseudonym";

describe("holder-local project pseudonyms", () => {
  it("is stable within one project and different across projects", async () => {
    const holderSecret = new Uint8Array(32).fill(7);
    const first = await deriveProjectPseudonym(holderSecret, "project-alpha");
    const repeated = await deriveProjectPseudonym(holderSecret, "project-alpha");
    const otherProject = await deriveProjectPseudonym(holderSecret, "project-beta");

    expect(first).toBe(repeated);
    expect(first).not.toBe(otherProject);
    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("rejects weak secrets and empty project contexts", async () => {
    await expect(deriveProjectPseudonym(new Uint8Array(16), "project-alpha")).rejects.toThrow();
    await expect(deriveProjectPseudonym(new Uint8Array(32), "")).rejects.toThrow();
  });
});
