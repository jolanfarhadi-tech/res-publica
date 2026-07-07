import type { ModuleManifest } from "../manifest";

export const aiLayerManifest: ModuleManifest = {
  moduleName: "ai-layer",
  entities: [],
  databaseTables: ["ai_query_log", "ai_cost_ledger"],
  apiRoutes: ["/api/ai-layer/query"],
  dashboardContribution: "ai-cost-governance-summary",
  aiLayerCapabilities: [],
};
