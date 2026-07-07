import type { ModuleManifest } from "../manifest";

export const dashboardManifest: ModuleManifest = {
  moduleName: "dashboard",
  entities: ["Person", "ConsentRecord"],
  databaseTables: ["dashboard_module_manifest_entries", "user_preferences", "impact_evidence_records"],
  apiRoutes: ["/api/dashboard/manifest", "/api/dashboard/digest", "/api/dashboard/impact-tracker", "/api/dashboard/preferences"],
  dashboardContribution: null,
  aiLayerCapabilities: ["personalized-digest", "cold-start-topic-recommendation"],
};
