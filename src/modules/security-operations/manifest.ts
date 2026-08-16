import type { ModuleManifest } from "../manifest";

export const securityOperationsManifest: ModuleManifest = {
  moduleName: "security-operations",
  entities: ["AuditLog"],
  databaseTables: [
    "security_incidents",
    "security_observations",
    "security_attribution_claims",
    "security_incident_correlations",
  ],
  apiRoutes: [
    "/api/operations/security",
    "/api/operations/security/incidents/{incidentId}/claims",
    "/api/operations/security/correlations",
  ],
  dashboardContribution: "security-operations",
  aiLayerCapabilities: [],
};
