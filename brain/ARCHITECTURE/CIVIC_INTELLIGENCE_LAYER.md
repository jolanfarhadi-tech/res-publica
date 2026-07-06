# Civic Intelligence Layer

```
Type: Foundation Architecture
Status: Draft — pending ADR-019
Version: 1.0.0-draft
Authorized by: ADR-019 (draft)
Extends/Reconciles with: docs/source/methodology/CIVIC_INTELLIGENCE.md,
  docs/source/foundation/01_HARM_OPERATING_SYSTEM.md,
  docs/source/methodology/RESPONSIBILITY_DASHBOARD.md,
  brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md
```

**Canonical relationship — read this first:** this document does not define a new Innovation competing with the existing, canonical **Civic Intelligence Lab** (Innovation 5, `docs/source/methodology/CIVIC_INTELLIGENCE.md`). It is a deeper architectural specification of that same Innovation, in the same relationship `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` has to `docs/source/methodology/RESPONSIBILITY_ANNEXES.md`. The existing methodology document's Purpose, Definitions, Workflow, and Roles are not altered here.

## 1. Core Definition

> **The Civic Intelligence Layer is the layer where structured knowledge becomes collective intelligence.**

**Motto:** *"Think Together Before Acting Together."*

## 2. Position in the Stack

```
Layer 1 — Stories                    (= Innovation 1, Responsibility Biography Lab)
Layer 2 — Responsibility             (= Innovation 2, Responsibility Mapping Lab)
Layer 3 — Priorities                 (= Innovation 3, Responsibility Dashboard)
Layer 4 — Knowledge                  (= Innovation 4, Responsibility Annexes)
Layer 5 — Civic Intelligence         (= Innovation 5, Civic Intelligence Lab)
Innovation 6 — Policy & Action Lab   (proposed extension — not yet in the canonical
                                       5-Innovation list of docs/source/foundation/01_HARM_OPERATING_SYSTEM.md)
Innovation 7 — Responsibility Observatory (proposed extension — same status as above)
```

**Flagged, not silently adopted:** Innovations 6 and 7 are new to this repository. `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` currently names exactly five canonical Innovations. Naming Innovation 6/7 here does not amend that document or make them canonical — that requires its own future decision against `01_HARM_OPERATING_SYSTEM.md` directly, which this document does not perform.

## 3. The Six-Step Intelligence Cycle

1. **Listening** — draws on the accumulated Story/account collection (Layer 1).
2. **Mapping** — draws on Responsibility Maps (Layer 2).
3. **Knowledge Building** — draws on validated Annexes and Codex entries (Layer 4).
4. **Pattern Recognition** — identifies recurring structures across the validated evidence base.
5. **Scenario Thinking** — builds explorative (not predictive) futures from recognized patterns.
6. **Collective Intelligence** — synthesizes the above into shared understanding and orientation, closing the loop back into future Listening.

This cycle is the internal structure of the existing Civic Intelligence Lab Workflow (`CIVIC_INTELLIGENCE.md` §Workflow: "Synthesize → Draft → Human review → Publish"), made explicit as six steps rather than four, in the same way Scientific Review's four levels made the Annex Architecture's single review step explicit (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7).

## 4. The Intelligence Community

Citizens, Experts, Civil Society, Institutions, Researchers, Moderators. These map onto existing roles already defined in `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` §Roles (Participant, Expert, Community Leader, Institution, Researcher, Moderator) — no new role is introduced; "Civil Society" is the only term without a direct 1:1 existing mapping and is treated here as a collective label for Community/Community Leader roles acting jointly, not a new individual role.

## 5. Tools

Responsibility Dashboard, Responsibility Annexes, Stakeholder Mapping, Scenario Analysis, Collective Reflection, Civic Foresight. The first two are existing canonical tools (`RESPONSIBILITY_DASHBOARD.md`, `RESPONSIBILITY_ANNEXES.md`), reused, not redefined. Stakeholder Mapping, Scenario Analysis, Collective Reflection, and Civic Foresight are named here for the first time as this Layer's own working methods; none has its own document yet — they remain conceptual until specified in detail.

## 6. Outputs

Civic Intelligence Report, Future Scenarios, Strategic Insights, Shared Understanding, Democratic Learning, Public Knowledge Commons, Policy & Action Recommendations. "Civic Intelligence Report" and "Recommendations" are the existing canonical outputs (`CIVIC_INTELLIGENCE.md` §Outputs); the remainder are new, more granular output categories introduced by this document.

## 7. Implementation Sketch (conceptual — not LOCKED Core Domain Model entities)

```typescript
interface IntelligenceCycle {
  id: string;
  cohortRef: string;          // which cycle/cohort this run belongs to
  stepsCompleted: Array<"listening" | "mapping" | "knowledge_building"
    | "pattern_recognition" | "scenario_thinking" | "collective_intelligence">;
  status: "in_progress" | "complete";
}

interface Pattern {
  id: string;
  derivedFromRefs: string[];  // Codex/Annex references this pattern is grounded in
  description: string;        // human-authored, never auto-published
  confidence: "low" | "medium" | "high"; // evidence-quality confidence — never a person score
}

interface Scenario {
  id: string;
  patternRef: string;
  horizon: "1yr" | "3yr" | "10yr";
  explorative: true;          // always true — scenarios are never predictive
}

interface OrientationStatement {
  id: string;
  scenarioRefs: string[];
  statement: string;          // orientation, not a directive — see Guardrails
  reviewedBy: string;         // human sign-off, mandatory
}
```

**This is a sketch, not a domain model addition.** None of these four types is proposed for entry into `brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED) by this document. Any future concrete data representation requires its own ADR against that locked model, consistent with how Annex, Evidence Package, and Civic Contribution were kept conceptual-only in `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §11.

## 8. Guardrails

1. **Only validated inputs.** The Intelligence Cycle draws only on Codex-validated or published evidence — never draft or unreviewed material.
2. **Human-in-the-loop is mandatory** at every step, consistent with every other AI Integration boundary in this repository.
3. **Scenarios are explorative, not predictive.** A Scenario is a possibility to think through, never a forecast presented as fact.
4. **Confidence evaluates data quality, never people.** Consistent with Zero Gamification (Core Principle 2) and the same rule already stated for Scientific Review's Review Criteria.
5. **Traceability is required.** Every Pattern, Scenario, and Orientation Statement must be traceable to the specific validated evidence it derives from — no unsourced synthesis.
6. **Orientation, not authority.** An Orientation Statement informs institutional and community learning; it does not itself constitute a governance decision or bind any institution — consistent with Human Approval Authority remaining the sole decision-making role (Constitution §16).

## 9. Website vs. Platform Boundary

The website may explain this layer (e.g., at `/labs/civic-intelligence` or `/methode`) with static, illustrative content only. The productive implementation — the actual Intelligence Cycle processing, Pattern detection, Scenario generation — belongs to the platform roadmap, not the public website, consistent with the Website/Platform distinction already established in `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md` §Website vs. Platform Distinction.

## References

`docs/source/methodology/CIVIC_INTELLIGENCE.md` · `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` · `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md` · `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` · `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md`

## Unresolved Source Gaps

Innovation 6 (Policy & Action Lab) and Innovation 7 (Responsibility Observatory) have no specification beyond their names — no purpose, workflow, or roles are defined for either. Stakeholder Mapping, Scenario Analysis, Collective Reflection, and Civic Foresight (§5) are named tools with no dedicated methodology document yet.
