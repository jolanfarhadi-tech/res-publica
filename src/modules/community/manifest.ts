import type { ModuleManifest } from "../manifest";

export const communityManifest: ModuleManifest = {
  moduleName: "community",
  entities: ["Person", "ConsentRecord"],
  databaseTables: ["community_members", "ladder_stage_transitions", "evangelism_invitations"],
  apiRoutes: [
    "/api/community/ladder-stage",
    "/api/community/touchpoint",
    "/api/community/invitation",
    "/api/community/referral-link",
    "/api/community/consent",
  ],
  dashboardContribution: "community-ladder-summary",
  aiLayerCapabilities: [],
};
