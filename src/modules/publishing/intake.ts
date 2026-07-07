import { createId } from "../../domain/shared";
import type { SubmissionItem } from "./types";

/** Intake Submission — accept raw material into the pipeline. */
export function submitIntake(input: {
  title: string;
  rawContent: string;
  submittedByPersonId: string;
}): SubmissionItem {
  return {
    id: createId(),
    title: input.title,
    rawContent: input.rawContent,
    submittedByPersonId: input.submittedByPersonId,
    submittedAt: new Date(),
    status: "pending",
  };
}
