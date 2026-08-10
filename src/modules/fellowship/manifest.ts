import type { ModuleManifest } from "../manifest";

export const fellowshipManifest: ModuleManifest = {
  moduleName: "fellowship",
  entities: ["Person", "AuditLog"],
  databaseTables: [
    "fellowship_role_scopes",
    "fellowship_candidacies",
    "fellowship_evidence_refs",
    "fellowship_review_assignments",
    "fellowship_conflict_declarations",
    "fellowship_reviews",
    "fellowship_records",
    "fellowship_status_changes",
    "fellowship_attributions",
  ],
  apiRoutes: [
    "/api/fellowship/role-scopes",
    "/api/fellowship/applications",
    "/api/fellowship/applications/:candidacyId",
    "/api/fellowship/dashboard",
    "/api/fellowship/operations/role-scopes",
    "/api/fellowship/operations/role-scopes/:roleScopeId/approve",
    "/api/fellowship/operations/candidacies",
    "/api/fellowship/operations/candidacies/:candidacyId/assign",
    "/api/fellowship/operations/assignments/:assignmentId/conflict",
    "/api/fellowship/operations/assignments/:assignmentId/review",
    "/api/fellowship/operations/candidacies/:candidacyId/decision",
    "/api/fellowship/operations/records/:fellowshipId/status",
  ],
  dashboardContribution: "fellowship-status",
  aiLayerCapabilities: [],
};
