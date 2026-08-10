import type { FellowshipCandidacyStatus, FellowshipRecordStatus } from "./types";

export function mayEnterFellowshipReview(status: FellowshipCandidacyStatus) {
  return status === "submitted" || status === "more-information-required";
}

export function isFellowshipCandidacyFinal(status: FellowshipCandidacyStatus) {
  return status === "approved" || status === "rejected" || status === "withdrawn";
}

export function mayTransitionFellowshipRecord(from: FellowshipRecordStatus, to: FellowshipRecordStatus) {
  return (
    (from === "active" && (to === "suspended" || to === "ended")) ||
    (from === "suspended" && (to === "active" || to === "ended"))
  );
}
