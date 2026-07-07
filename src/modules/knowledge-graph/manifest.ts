import type { ModuleManifest } from "../manifest";

/**
 * Knowledge Graph's Plugin Architecture manifest (`ADR-003`). Declarative
 * only — no table or route is created or wired by this file; Backend/API
 * Architecture implementation will act on this metadata later.
 */
export const knowledgeGraphManifest: ModuleManifest = {
  moduleName: "knowledge-graph",
  entities: [],
  databaseTables: ["kg_entities", "kg_relationships"],
  apiRoutes: ["/api/knowledge-graph/lookup", "/api/knowledge-graph/related", "/api/knowledge-graph/search"],
  dashboardContribution: null,
  aiLayerCapabilities: [],
};
