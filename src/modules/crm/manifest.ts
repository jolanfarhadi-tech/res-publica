import type { ModuleManifest } from "../manifest";

export const crmManifest: ModuleManifest = {
  moduleName: "crm",
  entities: ["Organization", "Payment"],
  databaseTables: [
    "donor_records",
    "institutional_partners",
    "grant_funders",
    "conflict_of_interest_disclosures",
    "funding_source_publication_records",
    "partnership_status_logs",
  ],
  apiRoutes: [
    "/api/crm/relationship",
    "/api/crm/disclosure",
    "/api/crm/partnership-status",
    "/api/crm/funding-disclosure",
    "/api/crm/funder-report",
  ],
  dashboardContribution: null,
  aiLayerCapabilities: [],
};
