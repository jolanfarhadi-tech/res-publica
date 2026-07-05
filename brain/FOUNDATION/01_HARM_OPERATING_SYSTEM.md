# Res Publica — HARM Operating System

**Status: architecture only. Not software architecture, not workflow implementation, not database, API, or UI.** This document formalizes the existing HARM methodology as Res Publica's official operating model — describing how the platform operates from a citizen's first interaction until collective intelligence is produced. No new philosophy is invented; no new domain entity, service, or AI capability is introduced. The Constitution, Foundation Architecture, Master Product Blueprint, Core Domain Model, Application Architecture, AI Governance Hierarchy, and Agent Activation Roadmap are read-only references throughout — none are modified.

---

# 1. Purpose of HARM

HARM is Res Publica's operating methodology — the conceptual cycle every civic interaction moves through, from a citizen sharing a first account of their experience to the platform producing evidence-grounded, actionable collective intelligence. It is the operational realization of principles already approved in the Constitution: evidence over assumption (Core Principle 1's citation-or-refuse discipline; the Responsibility Evidence Model's verification workflow), accountability traced to named humans (Constitution §3), and zero gamification at every stage (Core Principle 2 — no part of the HARM cycle scores, ranks, or compares people). HARM is an operating model, not a technical architecture: it describes *what happens and in what order*, not what is built, stored, or displayed.

---

# 2. The Five Innovations

## Innovation 1 — Listening
- **Purpose:** capture a citizen's account of their lived experience as the raw input to the entire HARM cycle.
- **Input:** a citizen's account, shared through any Res Publica touchpoint (Community, Dialogue, Events).
- **Core Question:** "What happened, in the citizen's own words?"
- **Activities:** story collection; active, non-judgmental listening; capturing context without premature categorization or evaluation.
- **Outputs:** a Story, added to the Story Collection.
- **Expected Outcomes:** a growing, faithful record of lived civic experience — no Story is scored, ranked, or weighted against another (Core Principle 2).
- **Transition to next Innovation:** a captured Story becomes the input to Responsibility Mapping — identifying who or what holds responsibility for the conditions it describes.

## Innovation 2 — Responsibility Mapping
- **Purpose:** identify who or what holds responsibility for the conditions or events a Story describes.
- **Input:** one or more Stories from Innovation 1.
- **Core Question:** "Who or what is responsible for this?"
- **Activities:** mapping a Story's content to responsible actors, institutions, or systems, using the already-approved `Organization` (institutional responsibility) and `Person` (individual accountability) entities; connecting to `Responsibility Evidence` records where a verifiable claim already exists.
- **Outputs:** a Responsibility Map — a structured linkage between a Story and the entity/entities responsible for its conditions.
- **Expected Outcomes:** an evidence-grounded map of accountability across the civic terrain the Story Collection covers.
- **Transition to next Innovation:** individual Responsibility Maps aggregate into the Responsibility Dashboard once enough mapped responsibility exists to view collectively.

## Innovation 3 — Responsibility Dashboard
- **Purpose:** aggregate Responsibility Maps into a collective, navigable view of where responsibility concentrates across all captured Stories.
- **Input:** the accumulated set of Responsibility Maps.
- **Core Question:** "Where does responsibility concentrate, and what patterns recur?"
- **Activities:** aggregation and pattern identification, surfacing recurring responsible actors or systemic issues — read-only and aggregate; never an individually-scored or ranked view (Core Principle 2).
- **Outputs:** the Responsibility Dashboard — an aggregate, pattern-level knowledge product.
- **Expected Outcomes:** staff, researchers, and civic actors can see where responsibility concentrates without reviewing every individual Story.
- **Transition to next Innovation:** patterns surfaced in the Dashboard that warrant deeper documentation proceed to Responsibility Annexes.

## Innovation 4 — Responsibility Annexes
- **Purpose:** produce a deeper, evidence-backed account of a specific responsibility pattern surfaced in the Dashboard.
- **Input:** a pattern or cluster identified in the Responsibility Dashboard.
- **Core Question:** "What is the full, evidenced account of this specific responsibility pattern?"
- **Activities:** research and evidence-gathering (tying to `Responsibility Evidence` records), documentation, human verification by a named reviewer distinct from the drafter (Constitution §3).
- **Outputs:** a Responsibility Annex — a documented, evidence-backed account of one responsibility pattern.
- **Expected Outcomes:** a defensible, citable body of institutional knowledge about specific, real responsibility patterns.
- **Transition to next Innovation:** accumulated Annexes become the substrate from which genuine Civic Intelligence is synthesized.

## Innovation 5 — Civic Intelligence
- **Purpose:** synthesize Stories, Responsibility Maps, Dashboard patterns, and Annexes into actionable collective understanding — the stated end-state of one HARM cycle.
- **Input:** the accumulated Story Collection, Responsibility Maps, Dashboard patterns, and Annexes.
- **Core Question:** "What does the civic community now understand, and what should be done?"
- **Activities:** synthesis by staff, Fellows, and Researchers, with the already-approved AI Layer (`ADR-008`) grounding retrieval/citation over this same evidence base — the AI Layer never originates a conclusion itself (Core Principle 1); cross-cutting analysis; recommendation drafting.
- **Outputs:** Civic Intelligence Reports and Recommendations, added to the Knowledge Repository.
- **Expected Outcomes:** a trustworthy, evidence-grounded, citable body of collective understanding the civic community can act on.
- **Transition to next Innovation:** none — this is the terminal stage of one HARM cycle. Its outputs, via the Knowledge Repository, become durable input to future Listening, closing the loop without constituting a literal "Innovation 6."

---

# 3. The Analytical Engine — HARM

## H — Harm
- **Purpose:** identify and name the actual harm or impact a Story describes.
- **Questions answered:** What harm occurred? To whom? How severe or widespread?
- **Required evidence:** the Story itself and any corroborating account.
- **Produced evidence:** a documented harm description, feeding Responsibility Mapping.
- **How it supports prioritization:** harms with wider reach or greater severity surface as patterns in the Responsibility Dashboard — always a qualitative, evidence-based judgment, never a numeric score (Core Principle 2).

## A — Accountability
- **Purpose:** establish who is accountable for the identified harm.
- **Questions answered:** Who holds responsibility? Is that responsibility acknowledged?
- **Required evidence:** the Responsibility Map linkage, `Organization`/`Person` references, `Responsibility Evidence` records where available.
- **Produced evidence:** a named accountability linkage, feeding the Responsibility Dashboard and Annexes.
- **How it supports prioritization:** patterns where accountability is contested, denied, or unaddressed are natural candidates for deeper Annex documentation.

## R — Repair
- **Purpose:** identify what repair, remedy, or corrective action would address the harm.
- **Questions answered:** What would make this right? Has repair already been attempted?
- **Required evidence:** the harm description (H) and accountability linkage (A).
- **Produced evidence:** a documented repair pathway or gap, included in the relevant Annex.
- **How it supports prioritization:** harms with no attempted repair, or repeatedly failed repair, are prioritized for Civic Intelligence synthesis and Recommendations.

## M — Mobilization
- **Purpose:** identify what collective civic action could support repair.
- **Questions answered:** What can citizens, Fellows, or institutions do together about this?
- **Required evidence:** the Repair pathway (or gap) and the accumulated Annex.
- **Produced evidence:** Recommendations and Civic Intelligence Report content directed at real, collective next steps.
- **How it supports prioritization:** harms with a genuine, actionable mobilization pathway are prioritized for publication over those with no realistic collective-action path yet.

---

# 4. Cumulative Knowledge Flow

```
Stories
  ↓
Responsibilities
  ↓
Priorities
  ↓
Knowledge
  ↓
Collective Intelligence
```

Each stage requires the previous stage's output as its raw material: responsibility cannot be mapped without a Story to map; priorities cannot be identified without Responsibility Maps to aggregate into patterns; durable Knowledge (Annexes) cannot be produced without Priorities to focus documentation effort on; and Collective Intelligence is only trustworthy if synthesized from real, evidenced Knowledge rather than asserted independently. This mirrors the governance principles in §7 directly — "Evidence before opinion" and "Knowledge before action" are this flow's own logic, stated as rules.

---

# 5. Knowledge Products

Each product below is mapped to an already-approved Core Domain Model entity or module wherever a reasonable correspondence exists — none of these are new entities.

| Knowledge Product | Corresponds to (read-only reference) |
|---|---|
| Story Collection | Precursor to `Responsibility Evidence` — a Story is a raw, pre-verification account; it becomes formal `Responsibility Evidence` once substantiated and verified (`RESPONSIBILITY_EVIDENCE_MODEL.md`). |
| Responsibility Maps | A relationship view over `Organization` and `Person` (`CORE_DOMAIN_MODEL.md` §3a) — not a new entity, a structured linkage. |
| Responsibility Dashboard | An aggregate, read-only view — analogous in kind to the product `Dashboard` module's existing "read-aggregation consumer" role (`APPLICATION_ARCHITECTURE.md` §2), but a distinct knowledge product, not the same artifact. This naming adjacency is noted, not resolved, in §8. |
| Responsibility Annexes | A specific type of `Publication` (Publishing module). |
| Civic Intelligence Reports | A specific type of `Publication`, grounded via `Knowledge Asset` and the AI Layer (`ADR-008`). |
| Recommendations | Content within a Civic Intelligence Report — not a separate entity. |
| Knowledge Repository | The accumulated `Knowledge Asset` index (Knowledge Graph module, `ADR-007`). |

Formalizing any of these as distinct, named domain entities beyond this conceptual mapping — rather than instances of `Publication`/`Knowledge Asset` — would be a Core Domain Model change, and is explicitly out of scope here since the Core Domain Model is locked; that would require its own future ADR.

---

# 6. Participant Roles

Responsibilities only — no permission levels are defined or redefined here; those remain governed entirely by the already-approved Permission Matrix (`AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §7).

- **Citizens** — share Stories; participate in dialogue; receive Civic Intelligence.
- **Community Fellows** — human-gated, non-gamified (existing Fellowship concept, unchanged) — support Listening and Responsibility Mapping within their communities.
- **Experts** — contribute domain knowledge to Responsibility Annexes and Civic Intelligence synthesis.
- **Observers** — witness and monitor process integrity without directly authoring content.
- **Moderators** — ensure Stories and Annexes meet the platform's editorial/evidence standards (ties to the existing `ModerationQueueEntry`/Publishing sign-off discipline).
- **Researchers** — conduct the evidence-gathering work behind Responsibility Annexes (Research Lab module).
- **Organizations** — the entities Responsibility Mapping and Accountability often point to; may also participate directly by acknowledging responsibility and engaging in Repair and Mobilization.

---

# 7. Governance Principles

- Listening before judgment.
- Evidence before opinion.
- Responsibility before blame.
- Knowledge before action.
- Collective intelligence before decision.

Each is consistent with, and does not add to, already-approved Constitution principles: "Evidence before opinion" is the same discipline as Core Principle 1's citation-or-refuse rule and the Responsibility Evidence Model's verification workflow; "Responsibility before blame" matches the Accountability Model's (§3) traceability-not-punishment framing; "Collective intelligence before decision" matches the Verification Model's (§9) Review-Gate-before-approval discipline.

---

# 8. Validation

- **Compatible with Constitution:** Yes — zero gamification is maintained at every Innovation and every HARM-engine letter (no scores, ranks, or comparisons anywhere); AI's role in Civic Intelligence stays within Core Principle 1 (grounding/citation only, never origination).
- **Compatible with Foundation Architecture:** Yes — no tier boundary, module, or build order is touched.
- **Compatible with Master Product Blueprint:** Yes — Knowledge Products map onto existing Publishing, Knowledge Graph, and Research Lab modules; no new module implied.
- **Compatible with Core Domain Model (read-only):** Yes — every Knowledge Product is mapped onto an already-approved entity (`Publication`, `Knowledge Asset`, `Organization`, `Person`, `Responsibility Evidence`); no new entity is invented.
- **Compatible with Application Architecture (read-only):** Yes — no new service is invented; existing Publishing, Research, Community, and Analytics Services are the natural future implementers of this cycle.
- **Compatible with AI Governance Hierarchy:** Yes — Civic Intelligence's AI involvement stays within the AI Service's already-approved grounding-only remit; no Executive or Operational Agent role is redefined.
- **Compatible with Agent Activation Roadmap:** Yes — no new agent is invoked; this document doesn't require any agent activation change.

**One naming adjacency noted, not resolved:** the "Responsibility Dashboard" knowledge product (§5) and the approved product `Dashboard` module are related in kind (both are aggregate, read-only views) but are not the same artifact. Formally distinguishing or reconciling them, if ever needed, is a future decision — not made here.

**No architectural drift introduced.** No new domain entity, service, AI capability, or ADR was created.

---

Not committed. Stopping here for review.
