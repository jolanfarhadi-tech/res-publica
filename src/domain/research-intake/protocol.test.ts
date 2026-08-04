import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  backgroundCohortDigest,
  InvalidBackgroundCharacteristicsError,
  validateResearchContribution,
  type ApprovedResearchProtocol,
} from "./protocol";

const protocol: ApprovedResearchProtocol = {
  version: "research-protocol-v1",
  projectDigest: createHash("sha256").update("synthetic-project").digest("hex"),
  status: "synthetic",
  minimumCohortSize: 10,
  backgroundCharacteristics: [
    {
      key: "ageGroup",
      label: { de: "Altersgruppe", en: "Age group", fa: "گروه سنی" },
      categories: ["18-29", "30-44", "45-64", "65-plus"],
      required: true,
    },
    {
      key: "gender",
      label: { de: "Geschlecht", en: "Gender", fa: "جنسیت" },
      categories: ["female", "male", "diverse"],
      required: true,
    },
  ],
  contributionMaxLength: 4_000,
  retentionRule: "synthetic-test-data-delete-after-verification",
};

describe("approved research protocol validation", () => {
  it("requires exactly the protocol-defined background characteristics", () => {
    expect(() => validateResearchContribution(protocol, {
      background: { ageGroup: "30-44", gender: "diverse" },
      contribution: "Synthetic institutional observation.",
    })).not.toThrow();
    expect(() => validateResearchContribution(protocol, {
      background: { ageGroup: "30-44" },
      contribution: "Missing required characteristic.",
    })).toThrow(InvalidBackgroundCharacteristicsError);
    expect(() => validateResearchContribution(protocol, {
      background: { ageGroup: "30-44", gender: "prefer-not-to-say" },
      contribution: "Unapproved category.",
    })).toThrow(InvalidBackgroundCharacteristicsError);
  });

  it("derives cohort digests from project-local categories only", () => {
    const first = backgroundCohortDigest(protocol.projectDigest, {
      ageGroup: "30-44", gender: "diverse",
    });
    const reordered = backgroundCohortDigest(protocol.projectDigest, {
      gender: "diverse", ageGroup: "30-44",
    });
    const otherProject = backgroundCohortDigest("f".repeat(64), {
      ageGroup: "30-44", gender: "diverse",
    });
    expect(first).toBe(reordered);
    expect(first).not.toBe(otherProject);
  });
});
