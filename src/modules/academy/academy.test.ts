import { describe, expect, it } from "vitest";
import {
  AcademyWorkflowError,
  createCertificateVerificationId,
  nextCourseState,
} from "./workflow";

describe("Academy governed lifecycle", () => {
  const draft = {
    id: "course-1",
    state: "draft" as const,
    createdByPersonId: "editor-1",
    reviewedByPersonId: null,
    approvedByPersonId: null,
    version: 1,
  };

  it("permits only the defined draft-to-archive sequence", () => {
    expect(nextCourseState(draft, "submit-review", "editor-1")).toBe("review");
    expect(nextCourseState({ ...draft, state: "review" }, "approve", "reviewer-1")).toBe("approved");
    expect(nextCourseState({ ...draft, state: "approved", approvedByPersonId: "reviewer-1" }, "publish", "publisher-1")).toBe("published");
    expect(nextCourseState({ ...draft, state: "published" }, "archive", "publisher-1")).toBe("archived");
  });

  it("rejects skipped transitions and preserves separation of duties", () => {
    expect(() => nextCourseState(draft, "publish", "publisher-1")).toThrow(AcademyWorkflowError);
    expect(() => nextCourseState({ ...draft, state: "review" }, "approve", "editor-1"))
      .toThrowError(expect.objectContaining({ code: "creator_cannot_approve" }));
    expect(() => nextCourseState({ ...draft, state: "approved", approvedByPersonId: "reviewer-1" }, "publish", "reviewer-1"))
      .toThrowError(expect.objectContaining({ code: "approver_cannot_publish" }));
  });

  it("creates high-entropy non-sequential certificate verification identifiers", () => {
    const first = createCertificateVerificationId();
    const second = createCertificateVerificationId();
    expect(first).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(second).not.toBe(first);
    expect(first).not.toContain("course-1");
  });
});
