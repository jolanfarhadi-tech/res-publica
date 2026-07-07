import { createId } from "../../domain/shared";
import type { DraftDocument, TranslationHandoff } from "./types";

/** Translation Handoff — route a draft to a translator. */
export function createTranslationHandoff(draft: DraftDocument, locale: string): TranslationHandoff {
  return { id: createId(), draftId: draft.id, locale, status: "pending", assigneePersonId: null };
}

export function assignTranslator(handoff: TranslationHandoff, personId: string): TranslationHandoff {
  return { ...handoff, assigneePersonId: personId, status: "ai-draft" };
}

export function finalizeTranslation(handoff: TranslationHandoff): TranslationHandoff {
  if (handoff.status !== "ai-draft") {
    throw new Error("A translation must have an AI-drafted first pass before it can be finalized");
  }
  return { ...handoff, status: "human-finalized" };
}
