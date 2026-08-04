import { createHash } from "node:crypto";

export type BackgroundCharacteristic = {
  key: string;
  label: { de: string; en: string; fa: string };
  categories: string[];
  required: true;
};

export type ApprovedResearchProtocol = {
  version: string;
  projectDigest: string;
  status: "synthetic" | "approved-real-data";
  minimumCohortSize: number;
  backgroundCharacteristics: BackgroundCharacteristic[];
  contributionMaxLength: number;
  retentionRule: string;
};

export type ResearchContributionInput = {
  background: Record<string, string>;
  contribution: string;
};

export function validateResearchContribution(
  protocol: ApprovedResearchProtocol,
  input: ResearchContributionInput
): void {
  if (!/^research-protocol-v\d+$/.test(protocol.version) ||
    !/^[0-9a-f]{64}$/i.test(protocol.projectDigest) ||
    !Number.isInteger(protocol.minimumCohortSize) ||
    protocol.minimumCohortSize < 10 ||
    protocol.backgroundCharacteristics.length === 0 ||
    !Number.isInteger(protocol.contributionMaxLength) ||
    protocol.contributionMaxLength < 1 || !protocol.retentionRule.trim()) {
    throw new InvalidResearchProtocolError();
  }
  const expectedKeys = protocol.backgroundCharacteristics.map((item) => item.key).sort();
  const actualKeys = Object.keys(input.background).sort();
  if (JSON.stringify(expectedKeys) !== JSON.stringify(actualKeys)) {
    throw new InvalidBackgroundCharacteristicsError();
  }
  for (const characteristic of protocol.backgroundCharacteristics) {
    const value = input.background[characteristic.key];
    if (!value || !characteristic.categories.includes(value) ||
      /prefer|keine.?angabe|no.?answer|نمی.?خواهم|بدون.?پاسخ/iu.test(value)) {
      throw new InvalidBackgroundCharacteristicsError();
    }
  }
  if (!input.contribution.trim() || input.contribution.length > protocol.contributionMaxLength) {
    throw new InvalidResearchContributionError();
  }
}

export function backgroundCohortDigest(
  projectDigest: string,
  background: Record<string, string>
) {
  const canonical = Object.entries(background)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha256")
    .update("res-publica/research-cohort/v1\0")
    .update(projectDigest)
    .update("\0")
    .update(canonical)
    .digest("hex");
}

export class InvalidResearchProtocolError extends Error {}
export class InvalidBackgroundCharacteristicsError extends Error {}
export class InvalidResearchContributionError extends Error {}
