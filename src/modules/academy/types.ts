export type AcademyLocale = "de" | "en" | "fa";
export type AcademyPublicationState =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "archived";
export type AcademyEnrollmentPolicy =
  | "public"
  | "member-only"
  | "invitation"
  | "application";
export type AcademyWorkflowAction =
  | "submit-review"
  | "approve"
  | "publish"
  | "archive";

export type AcademyCourseRecord = {
  id: string;
  state: AcademyPublicationState;
  createdByPersonId: string;
  reviewedByPersonId: string | null;
  approvedByPersonId: string | null;
  version: number;
};
