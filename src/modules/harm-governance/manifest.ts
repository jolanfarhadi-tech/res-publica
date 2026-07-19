import type { ModuleManifest } from "../manifest";

export const harmGovernanceManifest: ModuleManifest = {
  moduleName: "harm-governance",
  entities: ["Person", "ConsentRecord", "AuditLog"],
  databaseTables: [
    "harm_cases",
    "harm_evidence_items",
    "basic_validation_decisions",
    "structured_hearings",
    "evidence_quality_assessments",
    "documentation_quality_reviews",
    "hearing_quality_reviews",
    "scientific_reviews",
    "repair_plans",
  ],
  apiRoutes: [],
  dashboardContribution: "harm-case-work-queue",
  aiLayerCapabilities: [],
};
