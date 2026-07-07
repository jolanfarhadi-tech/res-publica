import type { ModuleManifest } from "../manifest";

export const eventsManifest: ModuleManifest = {
  moduleName: "events",
  entities: ["Person", "Notification"],
  databaseTables: ["events", "registrations", "waitlist_entries", "event_qa_log", "outcome_publications"],
  apiRoutes: [
    "/api/events/listing",
    "/api/events/detail",
    "/api/events/registration",
    "/api/events/waitlist",
    "/api/events/capacity",
    "/api/events/qa",
    "/api/events/outcome",
  ],
  dashboardContribution: "events-summary",
  aiLayerCapabilities: ["event-scoped-qa"],
};
