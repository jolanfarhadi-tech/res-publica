import type { DashboardModuleManifestEntry, UserSegment } from "./types";

/**
 * Get Dashboard Manifest — one shared, ordered list, filtered per segment
 * rather than duplicated per segment (per spec: "differs between visitor
 * and participant segments without code duplication").
 */
const MODULE_ORDER: DashboardModuleManifestEntry[] = [
  { segment: "visitor", moduleName: "topic-chip-picker", order: 1 },
  { segment: "participant", moduleName: "personalized-digest", order: 1 },
  { segment: "participant", moduleName: "upcoming-events", order: 2 },
  { segment: "participant", moduleName: "impact-tracker", order: 3 },
  { segment: "fellow", moduleName: "personalized-digest", order: 1 },
  { segment: "fellow", moduleName: "upcoming-events", order: 2 },
  { segment: "fellow", moduleName: "impact-tracker", order: 3 },
];

export function getDashboardManifest(segment: UserSegment): DashboardModuleManifestEntry[] {
  return MODULE_ORDER.filter((e) => e.segment === segment).sort((a, b) => a.order - b.order);
}
