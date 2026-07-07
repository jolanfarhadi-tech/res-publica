import { describe, it, expect } from "vitest";
import { submitIntake } from "./intake";
import { createModerationEntry, assignReviewer, decide } from "./moderation";
import { authorDraft } from "./draft-authoring";
import { createTranslationHandoff, assignTranslator, finalizeTranslation } from "./translation";
import { signOff } from "./sign-off";
import { markReadyToPublish } from "./publish";
import { createLocalProvider } from "../ai-layer/providers/local-provider";
import { createLedger } from "../ai-layer/cost-governance";
import type { KnowledgeGraph } from "../knowledge-graph/types";

const REVIEWER_ID = "reviewer-person-id";
const APPROVER_ID = "approver-person-id";

function graphWithEntity(): KnowledgeGraph {
  return {
    entities: new Map([
      [
        "e1",
        {
          id: "e1",
          type: "topic",
          canonicalName: "Participation Impact",
          aliases: [],
          sources: [{ file: "src/content/de/pages/research.mdx", locale: "de" }],
        },
      ],
    ]),
    relationships: [],
  };
}

describe("Publishing pipeline — intake through publish-ready", () => {
  it("completes the full pipeline for a grounded submission", () => {
    const submission = submitIntake({
      title: "Participation research summary",
      rawContent: "participation impact",
      submittedByPersonId: "submitter-id",
    });
    expect(submission.status).toBe("pending");

    let entry = createModerationEntry(submission);
    entry = assignReviewer(entry, REVIEWER_ID);
    entry = decide(entry, "approved");
    expect(entry.decision).toBe("approved");

    const provider = createLocalProvider(graphWithEntity());
    const { draft } = authorDraft(submission, provider, createLedger(100));
    expect(draft.weakCitationFlags).toEqual([]);
    expect(draft.citations.length).toBeGreaterThan(0);

    let handoff = createTranslationHandoff(draft, "en");
    handoff = assignTranslator(handoff, "translator-id");
    handoff = finalizeTranslation(handoff);
    expect(handoff.status).toBe("human-finalized");

    const { record, auditEntry } = signOff(draft, APPROVER_ID);
    expect(auditEntry.action).toBe("publishing.sign-off");
    expect(auditEntry.actorPersonId).toBe(APPROVER_ID);

    const publishCommit = markReadyToPublish(draft.id, record);
    expect(publishCommit.status).toBe("ready");
    expect(publishCommit.commitHash).toBeNull();
  });

  it("flags a draft when the AI Layer has no grounded source, rather than inventing content", () => {
    const submission = submitIntake({
      title: "Unrelated topic",
      rawContent: "something with no matching entity at all",
      submittedByPersonId: "submitter-id",
    });
    const provider = createLocalProvider(graphWithEntity());
    const { draft } = authorDraft(submission, provider, createLedger(100));

    expect(draft.weakCitationFlags).toContain("no-grounded-source");
    expect(draft.content).toContain("DRAFT BLOCKED");
    expect(draft.content).toContain(submission.rawContent);
  });

  it("rejects moderation decisions without an assigned reviewer", () => {
    const submission = submitIntake({ title: "T", rawContent: "x", submittedByPersonId: "s" });
    const entry = createModerationEntry(submission);
    expect(() => decide(entry, "approved")).toThrow(/assigned reviewer/);
  });

  it("rejects publishing readiness if the sign-off record doesn't match the draft", () => {
    const submission = submitIntake({ title: "T", rawContent: "participation", submittedByPersonId: "s" });
    const provider = createLocalProvider(graphWithEntity());
    const { draft } = authorDraft(submission, provider, createLedger(100));
    const otherDraft = authorDraft(submission, provider, createLedger(100)).draft;
    const { record } = signOff(otherDraft, APPROVER_ID);

    expect(() => markReadyToPublish(draft.id, record)).toThrow(/does not match/);
  });
});
