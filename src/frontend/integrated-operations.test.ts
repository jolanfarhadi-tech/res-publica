import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { operationsCopy } from "../i18n/operations";

const clientSource = readFileSync(
  join(process.cwd(), "src", "components", "platform", "OperationsConsoleClient.tsx"),
  "utf8"
);

describe("integrated Operations navigation", () => {
  it("provides complete localized labels for every bounded operational area", () => {
    const areas = [
      "membership",
      "publishing",
      "academy",
      "fellowship",
      "knowledge-graph",
    ] as const;

    for (const locale of ["de", "en", "fa"] as const) {
      for (const area of areas) {
        expect(operationsCopy[locale].areaLabels[area]).toBeTruthy();
        expect(operationsCopy[locale].areaDescriptions[area]).toBeTruthy();
      }
    }
  });

  it("renders only server-authorized areas and links to existing workspaces", () => {
    expect(clientSource).toContain("overview.operationalAreas.map");
    expect(clientSource).toContain("`/${locale}/operations/academy`");
    expect(clientSource).toContain("`/${locale}/operations/fellowship`");
    expect(clientSource).toContain("`/${locale}/operations/knowledge-graph`");
  });
});
