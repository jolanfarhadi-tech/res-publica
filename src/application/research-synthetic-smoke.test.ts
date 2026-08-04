import { describe, expect, it } from "vitest";
import { runSyntheticResearchSmoke } from "./research-synthetic-smoke";

describe("synthetic research production smoke", () => {
  it("exercises real crypto and local redaction without persistence", async () => {
    await expect(runSyntheticResearchSmoke(new Date("2026-08-04T12:00:00.000Z"))).resolves.toEqual({
      bbsSelectiveDisclosure: true,
      holderProof: true,
      submitterIdentityRemovedLocally: true,
      institutionalContextPreserved: true,
      persistentRecordsCreated: 0,
      syntheticOnly: true,
    });
  }, 30_000);
});
