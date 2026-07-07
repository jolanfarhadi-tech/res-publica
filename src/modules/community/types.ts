import type { Locale } from "../../domain/person";

/**
 * Community — Foundation Build Order Step 5, MVP module #4.
 *
 * "Tracks, with explicit consent, where a person sits on the Community
 * Journey ladder... and triggers the next invitation via one of three
 * distinct per-language mechanics, as a deliberately non-ML, auditable
 * rules engine" (`mvp-module-blueprint.md`). "AI Features: None" — stated
 * explicitly in the approved spec. No file in this module calls the AI
 * Layer, by design, not by omission.
 */

export type LadderStage =
  | "anonymous"
  | "identified-interest"
  | "first-touch"
  | "contributing-participant"
  | "recurring-supporter";

export type CommunityMember = {
  id: string;
  personId: string;
  currentStage: LadderStage;
};

export type TouchpointType = "content-view" | "event-attendance" | "dialogue-participation" | "donation";

export type LadderStageTransition = {
  id: string;
  communityMemberId: string;
  fromStage: LadderStage;
  toStage: LadderStage;
  triggeringTouchpoint: TouchpointType;
  /** Knowledge Graph entity id this touchpoint relates to, if any. */
  relatedEntityId: string | null;
  timestamp: Date;
};

export type EvangelismMechanic =
  | "co-signed-institutional-invitation"
  | "comparative-outside-observer-invitation"
  | "trust-and-independence-first-invitation";

export type LanguageMechanicConfig = {
  locale: Locale;
  mechanic: EvangelismMechanic;
};

export type EvangelismInvitation = {
  id: string;
  communityMemberId: string;
  mechanic: EvangelismMechanic;
  createdAt: Date;
};
