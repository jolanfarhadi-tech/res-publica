import { createId } from "../../domain/shared";
import type { DraftDocument, TranslationHandoff } from "./types";

/** Translation Handoff — route a draft to a translator. */
export function createTranslationHandoff(draft: DraftDocument, locale: string): TranslationHandoff {
  return { id: createId(), draftId: draft.id, locale, status: "pending", assigneePersonId: null };
}

export function assignTranslator(
  handoff: TranslationHandoff,
  personId: string,
  startingDraft: "human" | "ai" = "human"
): TranslationHandoff {
  return {
    ...handoff,
    assigneePersonId: personId,
    status: startingDraft === "ai" ? "ai-draft" : "pending",
  };
}

export function finalizeTranslation(handoff: TranslationHandoff): TranslationHandoff {
  if (!handoff.assigneePersonId) {
    throw new Error("A translation must have an assigned human translator before it can be finalized");
  }
  if (handoff.status !== "pending" && handoff.status !== "ai-draft") {
    throw new Error("A translation must be pending human finalization");
  }
  return { ...handoff, status: "human-finalized" };
}
