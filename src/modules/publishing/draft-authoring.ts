import { createId } from "../../domain/shared";
import { queryAILayer } from "../ai-layer/query";
import type { AIProvider } from "../ai-layer/types";
import type { CostGovernanceLedger } from "../ai-layer/cost-governance";
import type { DraftDocument, SubmissionItem } from "./types";

/**
 * Draft Authoring — "drafts synthesized, source-grounded MDX copy from raw
 * intake material, refusing to draft claims it can't ground rather than
 * inventing plausible-sounding filler" (`mvp-module-blueprint.md`).
 *
 * Real integration with AI Layer (`ADR-008`) — every draft's citations and
 * refusal behavior come from `queryAILayer`, the same citation-or-refuse
 * enforcement any future module reuses, not a parallel AI mechanism
 * reimplemented here.
 */
export function authorDraft(
  submission: SubmissionItem,
  provider: AIProvider,
  ledger: CostGovernanceLedger
): { draft: DraftDocument; ledger: CostGovernanceLedger } {
  const { result, ledger: updatedLedger } = queryAILayer(provider, submission.rawContent, ledger);

  const draft: DraftDocument = {
    id: createId(),
    submissionId: submission.id,
    content: result.refused
      ? `[DRAFT BLOCKED: no grounded source found — original submission retained for human review.]\n\n${submission.rawContent}`
      : result.answer,
    citations: result.citations,
    weakCitationFlags: result.refused ? ["no-grounded-source"] : [],
    authorType: "ai",
    version: 1,
  };

  return { draft, ledger: updatedLedger };
}
