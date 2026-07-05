# Res Publica — Contribution & Impact Framework

**Status: architecture only. No implementation, scoring algorithm, gamification, database, API, or UI.** This document defines the conceptual framework for understanding Contribution, Impact, Trust, Verification, and Responsibility Evidence across Res Publica. No new domain entity, service, or ADR is introduced. `00_constitution.md`, `01_HARM_OPERATING_SYSTEM.md`, Foundation Architecture, Master Product Blueprint, the locked Core Domain Model and Application Architecture, the AI Governance Hierarchy, the Agent Activation Roadmap, and the Responsibility Evidence Model are read-only references throughout — none are modified.

---

# 1. Contribution

**What is a contribution?** A verifiable act of civic participation that advances Res Publica's mission — research, dialogue, or participation (`MISSION.md`'s three pillars) — and that can be documented as Responsibility Evidence (`RESPONSIBILITY_EVIDENCE_MODEL.md`).

**Who can contribute?** Any of the participant roles already named in the HARM Operating System (`01_HARM_OPERATING_SYSTEM.md` §6): Citizens, Community Fellows, Experts, Observers, Moderators, Researchers, and Organizations acting institutionally.

**What kinds of contributions exist?** Knowledge, Community, Dialogue, Research, Teaching, Events, Mentoring, Governance, Environmental, Financial, Technical, Documentation — each a category describing the *nature* of the act, not its value. No category is assigned points, weight, or rank relative to another; a Documentation contribution and a Research contribution are simply different kinds of acts, neither "worth more" than the other.

**When does a contribution begin?** When a person submits it as Responsibility Evidence — the "Evidence Submitted" step of that model's verification workflow (`RESPONSIBILITY_EVIDENCE_MODEL.md` §5).

**When does it end?** When the verification workflow reaches a terminal state — Accepted or Rejected, logged to `AuditLog`. The contribution *act* has a bounded lifecycle (submit → verify → log); the *effect* it may have does not necessarily end there — that effect is Impact (§2), a separate and often longer-running concept.

---

# 2. Impact

- **Individual Impact** — an effect on a specific Person's civic situation or circumstances.
- **Community Impact** — an effect on a `Community` (`CORE_DOMAIN_MODEL.md` §3b).
- **Institutional Impact** — an effect on an `Organization` or an institutional practice.
- **Environmental Impact** — an effect on environmental or sustainability outcomes. Naming this category does not imply the "Environmental Impact Platform" module is approved — it remains Future Proposal (`EXECUTION_ALIGNMENT.md`); this is a conceptual impact category only.
- **Knowledge Impact** — a contribution to the shared `Knowledge Asset` base (Knowledge Graph module, `ADR-007`; HARM Innovation 5).
- **Long-term Impact** — an effect only observable over extended time (e.g., a sustained shift in civic behavior or institutional practice), distinct from immediate effect.

**How Impact differs from Contribution:** a Contribution is the *act* — verified via Responsibility Evidence, with a bounded submit-to-verify lifecycle. Impact is the *effect* that act produces on the world — potentially delayed, diffuse, or only observable in aggregate. A verified Contribution is necessary but not sufficient for Impact; Impact is a separate, downstream, deliberately qualitative judgment about real-world effect (Constitution Core Principle 4 — civic effect, never attention or an individual metric), never a per-person score derived from Contribution.

---

# 3. Trust

**Trust as a civic property:** the collective, qualitative confidence the civic community and Res Publica place in a Person, Organization, or piece of Knowledge, based on accumulated verified Responsibility Evidence and consistent adherence to Constitutional principles. Trust is a standing, community-held judgment — **never a numerical score, never ranked, never displayed as a comparative measure.**

- **How trust is built:** through consistent, verified Responsibility Evidence over time; through transparent accountability (naming one's actions, not hiding them — Constitution §3/§7); through honoring Repair commitments (HARM's "R," `01_HARM_OPERATING_SYSTEM.md` §3).
- **How trust is lost:** through unverified or rejected claims; through unacknowledged responsibility for identified harm (HARM's "A" going unaddressed); through violations of Constitutional principles.
- **How trust can recover:** through genuine Repair (HARM Innovation 4 / engine letter R) and renewed verified contribution over time. Recovery is possible but never automatic or numerically calculated — it remains a qualitative civic and community judgment, consistent with there being no trust score to increment.

---

# 4. Verification

| Method | Strength | Limitation |
|---|---|---|
| Evidence | Strong when genuinely verifiable | Requires real documentation to exist |
| Witnesses | Adds independent corroboration | Subject to memory/bias limits |
| Peer Review | Leverages community knowledge | Risk of in-group bias |
| Expert Review | High credibility for technical/research claims | Slower, resource-constrained (nonprofit reality, Core Principle 8) |
| Public Records | Highly reliable where available | Not available for all claim types |
| Organization Confirmation | Authoritative for institutional claims | An Organization may have its own incentives or conflicts |
| Community Confirmation | Reflects lived local knowledge | May not scale to less visible claims |
| Self Declaration | The only universally available method | Weakest form — must never alone be sufficient for a high-stakes claim, consistent with the Responsibility Evidence Model's rule that the Reviewer must differ from the Contributor (`RESPONSIBILITY_EVIDENCE_MODEL.md` §3) |

---

# 5. Responsibility Evidence

Reusing the approved model exactly as specified — not redesigned here.

- **Purpose:** a verified record of a specific civic contribution (`RESPONSIBILITY_EVIDENCE_MODEL.md` §1).
- **Lifecycle:** Created → Evidence Submitted → Human Verification → Accepted/Rejected → `AuditLog` → Impact Analytics (§5 of that model, unchanged).
- **Evidence sources:** as defined in that model's data model §4 (`Evidence source` field) — a sign-off record, an attendance log, a moderation entry, a publication credit, etc.
- **Validation:** a named Reviewer, distinct from the Contributor, sets `Verification status` to Accepted or Rejected (§4–5 of that model).
- **Relationship with `AuditLog`:** Responsibility Evidence is a contribution-scoped extension of `AuditLog`, not a parallel system (`RESPONSIBILITY_EVIDENCE_MODEL.md` §7).
- **Relationship with Contribution:** Responsibility Evidence *is* the verified documentation of a Contribution (§1 above) — Contribution is the act; Responsibility Evidence is its evidenced record.
- **Relationship with Trust:** accumulated, verified Responsibility Evidence is the qualitative basis for Trust (§3) — never a formula, never a score derived from a count of records.

---

# 6. Framework Relationships

```
Contribution
  ↓
Responsibility Evidence
  ↓
Verification
  ↓
Trust
  ↓
Impact
```

This order exists because each stage depends on the last being genuine: an act cannot be evidenced before it happens (Contribution → Responsibility Evidence); evidence is meaningless until checked by someone other than its author (Responsibility Evidence → Verification); Trust cannot be extended on the basis of unverified claims (Verification → Trust); and Impact — a real-world effect claim — is only credible once grounded in trusted, verified contribution, not asserted independently (Trust → Impact). This is the same "Evidence before opinion" / "Knowledge before action" discipline already established in HARM's governance principles (`01_HARM_OPERATING_SYSTEM.md` §7), applied specifically to contribution and impact.

---

# 7. Principles

- Evidence before recognition.
- Contribution before reputation.
- Trust before authority.
- Impact before visibility.
- Quality before quantity.
- Learning before competition.
- No gamification.
- No leaderboards.
- No popularity metrics.

Each is a direct application of Constitution Core Principle 2 (zero gamification) and Core Principle 4 (civic effect, never attention) to this specific framework — not a new principle, a restatement scoped to Contribution/Impact/Trust.

---

# 8. Out of Scope

This document explicitly does **not** define: a Reputation Engine, a Contribution Engine, an Impact Engine, Analytics, Dashboard, AI, any algorithm, any scoring mechanism, badges, ranks, or rewards. All of these — where they have been named at all — remain Future Proposal, not approved (`EXECUTION_ALIGNMENT.md`, `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`), and belong to later phases, not this framework.

---

# 9. Validation

- **Compatible with Constitution:** Yes — zero gamification (Core Principle 2) and civic-effect-not-attention (Core Principle 4) are the organizing logic of the entire document.
- **Compatible with HARM Operating System:** Yes — Contribution/Verification/Trust map directly onto HARM's Innovations and analytical engine (H/A/R/M) without redefining either.
- **Compatible with Foundation Architecture:** Yes — no tier, module, or build order touched.
- **Compatible with Master Product Blueprint:** Yes — no module redefined; contribution categories reference existing module scope only.
- **Compatible with Core Domain Model (read-only):** Yes — no new entity invented; `Community`, `Organization`, `Person`, `Responsibility Evidence` reused exactly as approved.
- **Compatible with Application Architecture (read-only):** Yes — no new service invented.
- **Compatible with Responsibility Evidence Model:** Yes — reused exactly as specified in §5 above, not redesigned.
- **Compatible with AI Governance Hierarchy:** Yes — no AI role or capability is introduced or redefined; AI is explicitly out of scope (§8).
- **Compatible with Agent Activation Roadmap:** Yes — no agent activation implied or required by this document.

**No architectural drift introduced.** No new entity, service, algorithm, or ADR was created.

---

Not committed. Stopping here for review.
