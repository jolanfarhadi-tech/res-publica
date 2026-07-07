/**
 * Dashboard — Foundation Build Order Step 5, MVP module #7.
 * "The personalization home for logged-in users... surfacing relevant
 * dialogues, matched research, a personalized digest, upcoming events,
 * and a concrete, non-gamified Impact Tracker, all from one shared module
 * manifest" (`mvp-module-blueprint.md`).
 *
 * `DashboardModuleManifestEntry` is a distinct concept from the Plugin
 * Architecture's `ModuleManifest` (`ADR-003`, `src/modules/manifest.ts`) —
 * this one orders UI modules per user segment; that one declares a
 * module's entities/tables/routes. Named distinctly to avoid conflating them.
 */

export type UserSegment = "visitor" | "participant" | "fellow";

export type DashboardModuleManifestEntry = {
  segment: UserSegment;
  moduleName: string;
  order: number;
};

export type UserPreference = {
  personId: string;
  /** Knowledge Graph entity ids the person has opted in to follow. */
  followedTopics: string[];
};

export type ImpactEvidenceRecord = {
  id: string;
  personId: string;
  description: string;
  sourceFile: string;
};
