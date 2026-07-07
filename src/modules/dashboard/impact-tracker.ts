import { createId } from "../../domain/shared";
import type { LadderStageTransition } from "../community/types";
import type { OutcomePublication } from "../events/types";
import type { ImpactEvidenceRecord } from "./types";

/**
 * Get Impact Tracker Data — "evidentiary... never a gamified score."
 * Real integration: derives traceable facts from Community's actual
 * ladder transitions and Events' actual outcome publications, never a
 * computed number. Callers are expected to pass only records already
 * scoped to this person (via their own CommunityMember/Registration
 * lookups) — this function does not itself cross-reference personId,
 * to avoid duplicating Community's/Events' own ownership of that data.
 */
export function buildImpactEvidence(
  personId: string,
  personsTransitions: readonly LadderStageTransition[],
  personsOutcomes: readonly OutcomePublication[]
): ImpactEvidenceRecord[] {
  const records: ImpactEvidenceRecord[] = [];

  for (const t of personsTransitions) {
    if (t.relatedEntityId) {
      records.push({
        id: createId(),
        personId,
        description: `Participation reflected in reaching "${t.toStage}" (via ${t.triggeringTouchpoint})`,
        sourceFile: t.relatedEntityId,
      });
    }
  }

  for (const o of personsOutcomes) {
    records.push({
      id: createId(),
      personId,
      description: `Attendance reflected in a published outcome: "${o.summary}"`,
      sourceFile: o.id,
    });
  }

  return records;
}
