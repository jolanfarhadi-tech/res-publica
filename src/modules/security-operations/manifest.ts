import type { ModuleManifest } from "../manifest";

export const securityOperationsManifest: ModuleManifest = {
  moduleName: "security-operations",
  entities: ["AuditLog"],
  databaseTables: [
    "security_incidents",
    "security_observations",
    "security_attribution_claims",
    "security_incident_correlations",
    "security_defensive_signals",
    "security_defensive_actions",
    "security_defensive_action_events",
  ],
  apiRoutes: [
    "/api/operations/security",
    "/api/operations/security/incidents/{incidentId}/claims",
    "/api/operations/security/correlations",
    "/api/operations/security/incidents/{incidentId}/responses",
    "/api/operations/security/responses/{actionId}",
  ],
  dashboardContribution: "security-operations",
  aiLayerCapabilities: [],
};
