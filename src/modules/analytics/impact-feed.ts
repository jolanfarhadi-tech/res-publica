import type { ImpactEvidenceRecord } from "../dashboard/types";

/**
 * Impact Tracker Feed — Analytics surfaces Dashboard's own
 * `ImpactEvidenceRecord`s faithfully; never re-derives them (per spec:
 * "Analytics can't correct bad data from its sources, only surface it
 * faithfully").
 */
export function feedImpactTrackerSource(records: readonly ImpactEvidenceRecord[]): readonly ImpactEvidenceRecord[] {
  return records;
}
