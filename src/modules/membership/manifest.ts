import type { ModuleManifest } from "../manifest";

export const membershipManifest: ModuleManifest = {
  moduleName: "membership",
  entities: ["Person", "Payment", "Organization"],
  databaseTables: [
    "members",
    "status_changes",
    "recurring_pledges",
    "institutional_supporter_profiles",
    "membership_benefit_grants",
  ],
  apiRoutes: [
    "/api/membership/create",
    "/api/membership/pledge",
    "/api/membership/status",
    "/api/membership/tiers",
    "/api/membership/renewal",
  ],
  dashboardContribution: "membership-summary",
  aiLayerCapabilities: [],
};
