import { bootstrapModules } from "../../../../modules/bootstrap";

export const dynamic = "force-dynamic";

export function GET() {
  const modules = bootstrapModules().map((manifest) => ({
    moduleName: manifest.moduleName,
    entities: manifest.entities,
    databaseTables: manifest.databaseTables,
    apiRoutes: manifest.apiRoutes,
    dashboardContribution: manifest.dashboardContribution,
    aiLayerCapabilities: manifest.aiLayerCapabilities,
  }));

  return Response.json({ modules });
}
