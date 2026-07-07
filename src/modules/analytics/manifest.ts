import type { ModuleManifest } from "../manifest";

export const analyticsManifest: ModuleManifest = {
  moduleName: "analytics",
  entities: ["Person"],
  databaseTables: ["metric_snapshots", "funnel_stage_events"],
  apiRoutes: [
    "/api/analytics/metrics",
    "/api/analytics/impact-feed",
    "/api/analytics/ai-spend-status",
    "/api/analytics/funnel-report",
    "/api/analytics/export",
  ],
  dashboardContribution: null,
  aiLayerCapabilities: [],
};
