import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { aiLayerManifest } from "../modules/ai-layer/manifest";
import { analyticsManifest } from "../modules/analytics/manifest";
import { communityManifest } from "../modules/community/manifest";
import { crmManifest } from "../modules/crm/manifest";
import { dashboardManifest } from "../modules/dashboard/manifest";
import { eventsManifest } from "../modules/events/manifest";
import { knowledgeGraphManifest } from "../modules/knowledge-graph/manifest";
import { membershipManifest } from "../modules/membership/manifest";
import { publishingManifest } from "../modules/publishing/manifest";
import { harmGovernanceManifest } from "../modules/harm-governance/manifest";
import * as moduleSchema from "./module-schema";

const manifests = [
  knowledgeGraphManifest,
  aiLayerManifest,
  publishingManifest,
  communityManifest,
  membershipManifest,
  eventsManifest,
  dashboardManifest,
  crmManifest,
  analyticsManifest,
  harmGovernanceManifest,
];

describe("M1 module persistence coverage", () => {
  it("implements every database table declared by every MVP manifest", () => {
    const declaredTables = manifests.flatMap((manifest) => manifest.databaseTables).sort();
    const persistedTables = Object.values(moduleSchema).map(getTableName).sort();

    expect(persistedTables).toEqual(declaredTables);
  });

  it("does not introduce undeclared module tables", () => {
    const declaredTables = new Set(manifests.flatMap((manifest) => manifest.databaseTables));
    const undeclaredTables = Object.values(moduleSchema)
      .map(getTableName)
      .filter((table) => !declaredTables.has(table));

    expect(undeclaredTables).toEqual([]);
  });
});
