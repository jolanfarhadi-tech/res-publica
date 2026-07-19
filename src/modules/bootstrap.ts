import { registerModule } from "./registry";
import { getModule } from "./registry";
import type { ModuleManifest } from "./manifest";
import { knowledgeGraphManifest } from "./knowledge-graph/manifest";
import { aiLayerManifest } from "./ai-layer/manifest";
import { publishingManifest } from "./publishing/manifest";
import { communityManifest } from "./community/manifest";
import { membershipManifest } from "./membership/manifest";
import { eventsManifest } from "./events/manifest";
import { dashboardManifest } from "./dashboard/manifest";
import { crmManifest } from "./crm/manifest";
import { analyticsManifest } from "./analytics/manifest";
import { harmGovernanceManifest } from "./harm-governance/manifest";

/**
 * Bootstrap — registers every implemented module's manifest with the
 * Plugin Registry (`ADR-003`). This is the repository-integration point
 * tying Step 2 (Plugin Architecture) and Step 5 (MVP modules) together —
 * each new module's manifest is added here as it's built, rather than
 * left isolated and undiscoverable.
 */
const implementedManifests: readonly ModuleManifest[] = [
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

export function bootstrapModules(): readonly ModuleManifest[] {
  for (const manifest of implementedManifests) {
    if (!getModule(manifest.moduleName)) {
      registerModule(manifest);
    }
  }
  return implementedManifests.map((manifest) => getModule(manifest.moduleName)!);
}
