export type EditorialRole = "editor" | "reviewer" | "translator" | "publisher";
export type PublishingWorkflowAction =
  | "create-submission"
  | "create-draft"
  | "assign-reviewer"
  | "decide-moderation"
  | "assign-translation"
  | "finalize-translation"
  | "mark-ready";

export type PublishingWorkflowInput = {
  targetId: string;
  title: string;
  content: string;
  citations: string;
  weakCitationFlags: string;
  personId: string;
  locale: "de" | "en" | "fa";
  decision: "approved" | "rejected";
  reason: string;
  confirmed: boolean;
};

type BoundedWorkspace = {
  scope: string;
  roles: readonly EditorialRole[];
  submissions: readonly { id: string; title: string }[];
  drafts: readonly { id: string; submissionId: string; version: number }[];
  moderation: readonly {
    id: string;
    submissionId: string;
    draftId: string | null;
    decision: "pending" | "approved" | "rejected";
  }[];
  translations: readonly {
    id: string;
    draftId: string;
    locale: string;
    status: "pending" | "ai-draft" | "human-finalized";
  }[];
};

const roleActions: readonly [PublishingWorkflowAction, EditorialRole][] = [
  ["create-submission", "editor"],
  ["create-draft", "editor"],
  ["assign-reviewer", "editor"],
  ["assign-translation", "editor"],
  ["decide-moderation", "reviewer"],
  ["finalize-translation", "translator"],
  ["mark-ready", "publisher"],
];

export function publishingActionsForRoles(
  roles: readonly EditorialRole[]
): PublishingWorkflowAction[] {
  return roleActions
    .filter(([, role]) => roles.includes(role))
    .map(([action]) => action);
}

function lines(value: string): string[] {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export function buildPublishingWorkflowRequest(
  action: PublishingWorkflowAction,
  input: PublishingWorkflowInput,
  workspace: BoundedWorkspace
): Record<string, unknown> | null {
  if (!publishingActionsForRoles(workspace.roles).includes(action)) return null;
  const title = input.title.trim();
  const content = input.content.trim();
  const personId = input.personId.trim();
  const reason = input.reason.trim();

  switch (action) {
    case "create-submission":
      return title && content
        ? { action, publicationScope: workspace.scope, title, rawContent: content }
        : null;
    case "create-draft": {
      const submission = workspace.submissions.find((item) => item.id === input.targetId);
      const citations = lines(input.citations);
      return submission && content && citations.length
        ? {
            action,
            submissionId: submission.id,
            content,
            citations,
            weakCitationFlags: lines(input.weakCitationFlags),
            authorType: "human",
          }
        : null;
    }
    case "assign-reviewer": {
      const draft = workspace.drafts.find((item) => item.id === input.targetId);
      return draft && personId
        ? {
            action,
            submissionId: draft.submissionId,
            draftId: draft.id,
            reviewerPersonId: personId,
          }
        : null;
    }
    case "decide-moderation": {
      const moderation = workspace.moderation.find(
        (item) => item.id === input.targetId && item.decision === "pending" && item.draftId
      );
      return moderation?.draftId && reason
        ? {
            action,
            submissionId: moderation.submissionId,
            draftId: moderation.draftId,
            decision: input.decision,
            reason,
          }
        : null;
    }
    case "assign-translation": {
      const draft = workspace.drafts.find((item) => item.id === input.targetId);
      return draft && personId
        ? { action, draftId: draft.id, locale: input.locale, translatorPersonId: personId }
        : null;
    }
    case "finalize-translation": {
      const translation = workspace.translations.find(
        (item) => item.id === input.targetId && item.status !== "human-finalized"
      );
      return translation && content
        ? { action, handoffId: translation.id, content }
        : null;
    }
    case "mark-ready": {
      const draft = workspace.drafts.find((item) => item.id === input.targetId);
      return draft && input.confirmed ? { action, draftId: draft.id } : null;
    }
  }
}
