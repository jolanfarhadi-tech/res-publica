import { describe, expect, it } from "vitest";
import {
  buildPublishingWorkflowRequest,
  publishingActionsForRoles,
} from "./publishing-workflow-state";

const workspace = {
  scope: "website",
  roles: ["editor", "reviewer", "translator", "publisher"] as const,
  submissions: [{ id: "submission-1", title: "Source note" }],
  drafts: [{ id: "draft-1", submissionId: "submission-1", version: 1 }],
  moderation: [{
    id: "moderation-1",
    submissionId: "submission-1",
    draftId: "draft-1",
    decision: "pending" as const,
  }],
  translations: [{
    id: "translation-1",
    draftId: "draft-1",
    locale: "fa",
    status: "pending" as const,
  }],
};

const blankInput = {
  targetId: "",
  title: "",
  content: "",
  citations: "",
  weakCitationFlags: "",
  personId: "",
  locale: "fa" as const,
  decision: "approved" as const,
  reason: "",
  confirmed: false,
};

describe("governed Publishing workflow client boundary", () => {
  it("exposes only the actions belonging to independently held roles", () => {
    expect(publishingActionsForRoles(["editor"])).toEqual([
      "create-submission", "create-draft", "assign-reviewer", "assign-translation",
    ]);
    expect(publishingActionsForRoles(["reviewer", "translator"])).toEqual([
      "decide-moderation", "finalize-translation",
    ]);
    expect(publishingActionsForRoles(["publisher"])).toEqual(["mark-ready"]);
    expect(publishingActionsForRoles([])).toEqual([]);
    expect(publishingActionsForRoles(["editor", "publisher"])).not.toContain("publish");
    expect(buildPublishingWorkflowRequest("mark-ready", {
      ...blankInput,
      targetId: "draft-1",
      confirmed: true,
    }, { ...workspace, roles: ["editor"] })).toBeNull();
  });

  it("binds intake to the server-projected exact publication scope", () => {
    expect(buildPublishingWorkflowRequest("create-submission", {
      ...blankInput,
      title: "  Institutional note  ",
      content: "  Verified source material  ",
    }, workspace)).toEqual({
      action: "create-submission",
      publicationScope: "website",
      title: "Institutional note",
      rawContent: "Verified source material",
    });
  });

  it("requires a source citation and creates only a human-authored draft", () => {
    expect(buildPublishingWorkflowRequest("create-draft", {
      ...blankInput,
      targetId: "submission-1",
      content: "Human draft",
    }, workspace)).toBeNull();
    expect(buildPublishingWorkflowRequest("create-draft", {
      ...blankInput,
      targetId: "submission-1",
      content: "Human draft",
      citations: "source:constitution\nsource:mission",
    }, workspace)).toMatchObject({
      action: "create-draft",
      submissionId: "submission-1",
      authorType: "human",
      citations: ["source:constitution", "source:mission"],
    });
  });

  it("derives review targets from the bounded workspace rather than free-form artifact IDs", () => {
    expect(buildPublishingWorkflowRequest("assign-reviewer", {
      ...blankInput,
      targetId: "draft-1",
      personId: "reviewer-person",
    }, workspace)).toEqual({
      action: "assign-reviewer",
      submissionId: "submission-1",
      draftId: "draft-1",
      reviewerPersonId: "reviewer-person",
    });
    expect(buildPublishingWorkflowRequest("decide-moderation", {
      ...blankInput,
      targetId: "moderation-1",
      reason: "Sources and scope verified",
    }, workspace)).toEqual({
      action: "decide-moderation",
      submissionId: "submission-1",
      draftId: "draft-1",
      decision: "approved",
      reason: "Sources and scope verified",
    });
  });

  it("requires explicit confirmation and still stops at ready", () => {
    expect(buildPublishingWorkflowRequest("mark-ready", {
      ...blankInput,
      targetId: "draft-1",
    }, workspace)).toBeNull();
    expect(buildPublishingWorkflowRequest("mark-ready", {
      ...blankInput,
      targetId: "draft-1",
      confirmed: true,
    }, workspace)).toEqual({ action: "mark-ready", draftId: "draft-1" });
  });

  it("binds translation assignment and finalization to visible workspace records", () => {
    expect(buildPublishingWorkflowRequest("assign-translation", {
      ...blankInput,
      targetId: "draft-1",
      personId: "translator-person",
      locale: "fa",
    }, workspace)).toEqual({
      action: "assign-translation",
      draftId: "draft-1",
      locale: "fa",
      translatorPersonId: "translator-person",
    });
    expect(buildPublishingWorkflowRequest("finalize-translation", {
      ...blankInput,
      targetId: "translation-1",
      content: "Human-finalized translation",
    }, workspace)).toEqual({
      action: "finalize-translation",
      handoffId: "translation-1",
      content: "Human-finalized translation",
    });
    expect(buildPublishingWorkflowRequest("finalize-translation", {
      ...blankInput,
      targetId: "translation-outside-scope",
      content: "Not allowed",
    }, workspace)).toBeNull();
  });
});
