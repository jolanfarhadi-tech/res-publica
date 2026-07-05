# Res Publica — Contribution Concept Clarification

**Status: advisory analysis only. Does not modify the Constitution, any ADR, or any approved document. Not itself an approval to build anything — the underlying capability remains Future Proposal, requiring its own ADR before design, per `../AI/AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §11.**

---

## 1. What was reviewed

**Constitution Core Principle 2 (exact text, `../CONSTITUTION.md`):**
> "No points, badges, streaks, leaderboards, or progress bars framed as scores — not in the Community ladder, not in the Dashboard's Impact Tracker, not in the Fellowship System, not anywhere else, present or future. This was tested repeatedly against real temptations (Fellowship nomination signals, Academy course completion, dialogue participation) and held every time."

**The flagged capability:** "Contribution Credit Agent" *(historical term — superseded by Responsibility Evidence)* (`../AI/AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §3c) — "Contribution-credit tracking," no approved module, High risk, flagged as adjacent to the same gamification risk already raised for the proposed Reputation Engine and Leadership Engine (`EXECUTION_ALIGNMENT.md`).

**Also relevant, already approved:** the `AuditLog` domain entity (`ADR-002`) — an append-only, actor/action/target/timestamp record already *required* by the Constitution's Accountability Model (§3) for institutional actions. Fellowship (`GLOSSARY.md`) is already "human-gated and non-gamified... Not a badge or score."

## 2. Classification analysis

| Candidate | Fit | Reasoning |
|---|---|---|
| **Gamification** | Rejected as the goal, but real as a risk | The name "Contribution *Credit*" itself signals the problem: "credit" implies an accumulable, bankable unit of value — the same abstraction points/scores use. If implemented as an accumulating number, a visible balance, or anything rankable against other contributors, it *is* gamification, regardless of what it's called. |
| **Civic contribution documentation** | **Best fit for the legitimate underlying need** | A factual, descriptive record of what a person actually did (facilitated a dialogue, reviewed a research draft, translated a document) — no scoring, no aggregation into a single number, no ranking. This is documentation, not a game mechanic. |
| **Accountability ledger** | **Already required, already approved** | This is functionally what `AuditLog` (`ADR-002`) already is — an append-only record of actions. A contribution-specific view of it is not a new concept; it's an application of an existing, approved one. |
| **Civic portfolio** | Acceptable as a *presentation layer* only, not as the underlying mechanism | A personal, factual summary of one's own contributions ("you helped with X, Y, Z") shown privately to the contributor (and relevant staff, e.g., for Fellowship nomination consideration) is compatible — *if* it stays descriptive and is never shown as a public status symbol, ranking, or comparison. |
| **Reputation system** | **Rejected — incompatible as stated** | "Reputation" implies a comparative, cumulative standing over time — functionally indistinguishable from the "progress bars framed as scores" and "leaderboards" Core Principle 2 names explicitly, regardless of the label used. This classification should not be adopted under any name. |

## 3. Determination

The legitimate underlying need — Res Publica already has a real, approved reason to know what contributions happened (accountability, `ADR-002`'s `AuditLog`; informing human-gated Fellowship nominations, which already require *some* record of what a nominee has actually done) — is best served by **Civic Contribution Documentation**, understood as a contribution-scoped extension of the already-approved Accountability Ledger (`AuditLog`), optionally surfaced to the contributor themselves as a **Civic Portfolio** view.

**Reputation system and any point/credit/score framing are rejected outright**, not just as risky but as directly incompatible with Core Principle 2 as written — no renaming makes a scored, comparative, or rankable mechanic compliant.

## 4. Recommended terminology change

**Note — superseded:** this section originally recommended "Contribution Record Agent" as the replacement name. That name is itself now a **historical term — superseded by Responsibility Evidence**, the final canonical term established in `RESPONSIBILITY_EVIDENCE_MODEL.md`. The reasoning below (reject "Credit," reject scoring/currency framing) remains valid; the specific replacement name is updated to match the final decision.

- Rename **"Contribution Credit Agent"** *(historical term — superseded by Responsibility Evidence)* → **"Responsibility Evidence Agent"**. Drop the word "Credit" entirely — it is the single word most responsible for signaling a scoring/currency mechanic, independent of actual implementation.
- Rename the capability category in `../AI/AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §2 from **"Contribution Credit Agents"** *(historical term)* → **"Responsibility Evidence Agents"**.
- If a contributor-facing view is ever built, name it **"Responsibility Evidence Record"** or **"My Responsibility Evidence"**, not "portfolio" in a resume/branding sense and never "profile" in a social/comparative sense.

## 5. Recommended scope redefinition

**Keep:**
- Factual, append-only logging of specific contribution actions (what, when, in what capacity), as an extension of `AuditLog`'s existing pattern.
- Optional private, descriptive summary view for the contributor themselves.
- Optional input (a factual record, not a score) into the existing human-gated Fellowship nomination process — the human decision-maker sees *what happened*, not a computed number.
- Optional aggregate, anonymized statistics for funder/grant reporting (civic-effect measurement, consistent with Core Principle 4 — measuring civic effect, never attention or individual ranking).

**Remove / never build, under any name:**
- Any single accumulating number, score, or "credit balance" per person.
- Any leaderboard, ranking, or public comparison between contributors.
- Any badge, streak, or progress-bar-framed-as-a-score.
- Any visible "reputation" or "level" attached to a person's identity.

**The underlying contribution-tracking concept is not removed** — it is not fundamentally incompatible with the Constitution; the Constitution already requires a version of it (`AuditLog`, §3). Only the specific gamification-adjacent elements (credit/score/reputation/ranking framing) are excluded.

## 6. Relationship to the Reputation Engine / Leadership Engine flags

The same reasoning applies to the two capabilities flagged in `../GOVERNANCE/EXECUTION_ALIGNMENT.md` (§Phase 4: Human Engine). Recommend the same treatment be applied to those if/when they are ever reconsidered: reframe as documentation of what a person has done (facilitation record, leadership-role history) rather than a scored "reputation" or "leadership level" — with the same rejection of any point/ranking mechanic, and the same recognition that a factual record of roles/contributions is not itself incompatible with the Constitution.

## 7. What this document does not do

This is advisory. It does not amend `../CONSTITUTION.md`, create or modify any ADR, or approve any implementation. The capability remains **Future Proposal**, requiring its own ADR and Human Approval Authority sign-off before any design work begins, per Constitution §6 and §18. If pursued, that future ADR should cite this document's terminology recommendation and scope boundary directly, rather than re-deriving it.

---

Not committed. Stopping here for review.
