import type { ModuleManifest } from "../manifest";

export const publicApiManifest: ModuleManifest = {
  moduleName: "public-api",
  entities: [],
  databaseTables: [],
  apiRoutes: [
    "/api/public/v1",
    "/api/public/v1/content-graph/entities",
    "/api/public/v1/content-graph/relationships",
  ],
  dashboardContribution: null,
  aiLayerCapabilities: [],
};
