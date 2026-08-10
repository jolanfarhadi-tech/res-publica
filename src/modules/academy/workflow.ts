import { randomBytes } from "node:crypto";
import type {
  AcademyCourseRecord,
  AcademyPublicationState,
  AcademyWorkflowAction,
} from "./types";

const TRANSITIONS: Record<
  AcademyPublicationState,
  Partial<Record<AcademyWorkflowAction, AcademyPublicationState>>
> = {
  draft: { "submit-review": "review" },
  review: { approve: "approved" },
  approved: { publish: "published" },
  published: { archive: "archived" },
  archived: {},
};

export function nextCourseState(
  course: AcademyCourseRecord,
  action: AcademyWorkflowAction,
  actorPersonId: string
): AcademyPublicationState {
  const next = TRANSITIONS[course.state][action];
  if (!next) throw new AcademyWorkflowError("invalid_transition");
  if (action === "approve" && course.createdByPersonId === actorPersonId) {
    throw new AcademyWorkflowError("creator_cannot_approve");
  }
  if (action === "publish" && course.approvedByPersonId === actorPersonId) {
    throw new AcademyWorkflowError("approver_cannot_publish");
  }
  return next;
}

export function createCertificateVerificationId(): string {
  return randomBytes(24).toString("base64url");
}

export class AcademyWorkflowError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "AcademyWorkflowError";
  }
}
