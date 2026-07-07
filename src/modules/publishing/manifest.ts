import type { ModuleManifest } from "../manifest";

export const publishingManifest: ModuleManifest = {
  moduleName: "publishing",
  entities: ["Person"],
  databaseTables: [
    "submissions",
    "moderation_queue",
    "drafts",
    "translation_handoffs",
    "sign_off_records",
    "publish_commits",
  ],
  apiRoutes: [
    "/api/publishing/intake",
    "/api/publishing/moderation-queue",
    "/api/publishing/draft-authoring",
    "/api/publishing/translation-handoff",
    "/api/publishing/sign-off",
    "/api/publishing/publish",
  ],
  dashboardContribution: null,
  aiLayerCapabilities: ["draft-authoring"],
};
