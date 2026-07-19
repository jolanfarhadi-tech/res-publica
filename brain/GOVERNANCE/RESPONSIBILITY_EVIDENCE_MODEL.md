# Res Publica — Responsibility Evidence Model

**Status: architecture design document only. Does not modify the Constitution, Foundation Architecture, any ADR, or any approved module name. Does not implement code. Not itself an approval to build anything — see §10.**

*Builds on `CONTRIBUTION_CLARIFICATION.md`'s conclusion: "Contribution Credit" is incompatible with Constitution Core Principle 2; contribution tracking itself remains valid; accountability and evidence recording are already core, approved principles (§3, §7, §9).*

---

# 1. Executive Summary

**Evidence differs from credit, score, ranking, or reputation in what it claims and who it serves.** A credit, score, or reputation number claims a person's *comparative standing* — it compresses many different real actions into one abstract quantity designed to be compared against other people's. That compression, and that comparison, is exactly what Constitution Core Principle 2 forbids ("no points, badges, streaks, leaderboards, or progress bars framed as scores").

Evidence claims something narrower and more honest: *this specific thing happened, on this date, verified by this named person.* It is descriptive, not evaluative. It has no aggregate value, no ranking position, and no comparison to anyone else's record. Two people's evidence records are never "greater than" or "less than" each other — they are just different lists of different things that happened. This is the same discipline the Constitution's Accountability Model (§3) and `ADR-002`'s `AuditLog` already apply to institutional actions generally; this document extends that discipline specifically to civic contribution, rather than inventing a new, separate mechanism.

---

# 2. Core Principles

- **Accountability** — every evidence record traces to a named human actor and, where verification applies, a named human reviewer (Constitution §3).
- **Transparency** — the existence and criteria of the evidence process are documented and inspectable, never a hidden or opaque mechanism (Constitution §7).
- **Verifiability** — every record has a stated evidence source; nothing is recorded on the strength of an unsubstantiated claim alone.
- **Human dignity** — a person's contributions are described, never reduced to a number that stands in for their worth or standing.
- **No gamification** — no points, streaks, badges, or progress-bars-as-scores, under any name (Constitution §2).
- **No competition** — no mechanism that ranks, compares, or pits contributors against one another.
- **No social ranking** — no visible standing, tier, or level attached to a person's identity.
- **Privacy by design** — the default visibility of any field is the most restrictive one consistent with its purpose (see §6).

---

# 3. Terminology

| Candidate | Assessment |
|---|---|
| Contribution Record | Clear, low gamification risk, but generic — doesn't signal the verification/evidentiary discipline that distinguishes this from a simple activity log. |
| Contribution Registry | Sounds like a formal enrollment list (e.g., a business registry) — administratively neutral, but doesn't convey that each entry must be substantiated. |
| Contribution Ledger | "Ledger" ties naturally to `AuditLog`'s append-only pattern, which is a genuine strength — but "ledger" also carries accounting/bookkeeping connotations that risk being read as a running balance, which is uncomfortably close to the "credit" framing already rejected. |
| Responsibility Evidence | Ties directly to two already-approved concepts: the Responsibility Agent (`ADR-004`) and the Constitution's Accountability Model (§3). "Evidence" is inherently neutral and verifiable — evidence is judged true or false, substantiated or not, never ranked against other evidence. |
| Civic Evidence | Thematically fits the mission's "civic" branding (Civic Copilot, civic effect), but is broader than needed — could be read as covering evidence *about* civic conditions generally, not specifically about a person's contributions. |
| Public Responsibility Record | Explicit, but "Public" prejudges visibility incorrectly — §6 below establishes that most fields must default to private, not public. Naming it "Public" up front contradicts the privacy-by-design principle before the model is even used. |

**Recommended canonical term: Responsibility Evidence.**

**Why:** it is the only candidate that (a) reuses already-approved vocabulary (Responsibility Agent, Accountability Model) rather than introducing a new concept-word pairing, (b) carries no numeric, competitive, or transactional connotation, and (c) does not prejudge the record's visibility the way "Public Responsibility Record" does. "Evidence" is also the most precise word for what §5's workflow actually produces: a verified-or-not claim, not a running total.

---

# 4. Data Model

Conceptual fields for one Responsibility Evidence record — described here as a data model, not implemented as code or schema:

| Field | Meaning | Notes |
|---|---|---|
| Contributor | Reference to the `Person` entity (`ADR-002`) who performed the activity | Not a name string — a reference, consistent with the Core Domain Model |
| Activity | A factual, descriptive statement of what was done (e.g., "facilitated a dialogue session," "reviewed a research draft," "translated a document") | Free text or a small controlled vocabulary of activity types — never a numeric weight or value |
| Module | Which approved module the activity occurred within (e.g., Community, Publishing, Research Lab) | Reference to an existing module, not a new concept |
| Community | The language/community context (German, English, Farsi, or a specific local group) | Ties to Core Principle 7 (trilingual discipline) |
| Project | Reference to the specific initiative, dialogue, event, or publication the activity was part of | |
| Date | When the activity occurred | |
| Evidence source | What substantiates the record — a sign-off record, an attendance log, a moderation entry, a publication credit | Required; a record with no evidence source is incomplete, not merely "unverified" |
| Verification status | One of: Submitted, Verified, Rejected | A tri-state flag, never a numeric score, never averaged or summed |
| Reviewer | The named human who verified the record | Must be a different person from the Contributor — same conflict-of-interest rule already established for sign-off (Constitution §3) |
| Related impact | A qualitative reference to what civic effect (if any) this activity contributed to, per Analytics' existing civic-effect measurement | A description or reference, never a point value attached to the person |

**Explicitly not present in this model, on any field:** an aggregate total, a computed score, a percentile, a rank, or any field whose value is derived by comparing one Contributor's records to another's.

---

# 5. Verification Workflow

```
Created
  ↓
Evidence Submitted
  ↓
Human Verification
  ↓
Accepted / Rejected
  ↓
AuditLog
  ↓
Impact Analytics
```

- **Created** — a Responsibility Evidence record is drafted, referencing the Contributor, Activity, Module, Project, and Date.
- **Evidence Submitted** — the Evidence source field is attached; a record cannot proceed without one.
- **Human Verification** — a named Reviewer (never the Contributor themselves) checks the evidence source against the claimed Activity.
- **Accepted / Rejected** — the Verification status is set. A Rejected record is retained (not deleted) as an honest record that a claim was made and not substantiated, consistent with `AuditLog`'s append-only discipline — it is not hidden or purged, only marked.
- **AuditLog** — an Accepted (and, for transparency, a Rejected) record produces a corresponding `AuditLog` entry (actor = Reviewer, action = "verified"/"rejected" contribution evidence, target = the evidence record, timestamp), per §7.
- **Impact Analytics** — Accepted records may feed aggregate, anonymized civic-effect statistics (Analytics module), never individual scores or rankings.

---

# 6. Privacy Rules

- **Public fields:** none, by default. If any aggregate reporting is ever public-facing (e.g., "X dialogues were facilitated by community volunteers this year"), it must be anonymized and aggregate — never traceable to an individual Contributor.
- **Private fields (visible to the Contributor and authorized staff only):** Contributor, Activity, Module, Community, Project, Date, Evidence source, Related impact. *(Cross-reference: `docs/source/projects/MEMBER_PROFILE.md` specifies the Contributor-facing view of exactly this private tier — it does not add a new visibility tier or relax this one.)*
- **Sensitive fields (extra handling required):** Contributor identity where the Community context involves at-risk populations — explicitly, Farsi-speaking diaspora participants, given the real safety stakes `MISSION.md` already names for that audience. These records require the same heightened care already implied by the Constitution's trilingual-discipline principle (§7 / Core Principle 7).
- **Retention policy:** governed by the same nonprofit-resourcing and data-minimization discipline as the rest of the Core Domain Model (Constitution §11; `ADR-002`) — retain only as long as needed for accountability and Fellowship-nomination purposes, not indefinitely by default.
- **Deletion policy:** follows `ADR-002`'s existing amendment pattern for `AuditLog` — pseudonymization-on-erasure (actor/target reference redacted, action/timestamp facts retained) under GDPR Art. 17(3)'s accountability exception. This document does not re-decide that policy; it inherits it, including the same outstanding legal/data-protection sign-off already flagged as an open Phase 1 prerequisite (`brain/CONSTITUTION.md` §4, `PROJECT_BRAIN_STATUS.md`).
- **GDPR considerations:** a Responsibility Evidence record is created only with purpose-scoped consent (`ConsentRecord`, `ADR-002`) — a person must have consented to contribution-tracking specifically, separate from any other consent purpose, consistent with Core Principle 3 (opt-in, anonymous use always preserved).

---

# 7. Relation to AuditLog

Responsibility Evidence is **not a parallel system** — it is a contribution-scoped extension of the already-approved `AuditLog` entity (`ADR-002`). Every verification-workflow transition (§5) produces or updates an `AuditLog` entry using `AuditLog`'s existing shape (actor, action, target, timestamp). The additional fields in §4 (Activity, Module, Community, Project, Evidence source, Related impact) are contribution-specific detail attached to that same underlying log discipline, the same way Publishing's sign-offs and CRM's disclosure reviews already use `AuditLog`'s shared shape for their own `action` values. No second, independent logging mechanism is introduced.

---

# 8. Future Modules

Because Responsibility Evidence is generic over Module, Community, and Project, the same model — unchanged — can support future contribution-tracking needs in Community, Environmental Impact, Research, Education (Academy), Events, Membership, Volunteer Work, and Donations, simply by using a different Module/Activity value per record. None of these require a bespoke tracking mechanism, a new data model, or a new verification workflow of their own. Note that several of these (Environmental Impact, Volunteer Work as a distinct concept) are themselves still Future Proposal per `EXECUTION_ALIGNMENT.md` — this model doesn't approve them, it simply confirms that *if* they are ever approved, they would not need their own separate evidence architecture.

---

# 9. Forbidden Concepts

The following are forbidden in any Responsibility Evidence implementation, under any name or framing: **Points, XP, Tokens, Credits, Leaderboards, Badges, Levels, Ranks, Achievements, Reputation Scores, Social Scores, Competition, Behavior manipulation.** This list operationalizes Constitution Core Principle 2 for this specific model — a future ADR proposing this capability must explicitly confirm none of these appear anywhere in its design, not merely avoid the word "credit."

---

# 10. Recommendation

**Recommend: Future ADR** (not "documentation only," not "future implementation" directly).

**Why:** this model touches the Core Domain Model (it extends `AuditLog`, references `Person` and `ConsentRecord`) and defines new record types across multiple modules — per Constitution §6's classifying test, that is squarely an architecture/domain-model matter, which requires a new ADR and Human Approval Authority sign-off *before design work begins*, not after. This document is the design input such an ADR would cite; it is not itself sufficient authorization to build anything, consistent with how every other Future Proposal capability in `AGENT_SKILL_PLUGIN_ARCHITECTURE.md` and `EXECUTION_ALIGNMENT.md` has been treated.

---

# Validation

- **Compatible with Constitution Core Principle 2:** Yes — no points, scores, badges, streaks, leaderboards, or ranking appear anywhere in this model; §9 makes the exclusion explicit and operational.
- **Compatible with `ADR-002` `AuditLog`:** Yes — this model is an extension of `AuditLog`'s existing shape (§7), not a parallel or competing mechanism.
- **No architectural drift introduced:** Confirmed — no approved module was renamed, no new module was invented; all future extensions (§8) reuse the same model rather than requiring new architecture per module.
- **No new governance framework introduced:** Confirmed — this document defines a data/workflow model, not a new approval process; it uses the existing Human Approval Authority, ADR Governance Workflow, and Review Gate mechanisms already established in the Constitution.
- **Foundation Architecture preserved:** Confirmed — no change to `foundation-architecture.md`, `master-product-blueprint.md`, or any ADR.

---

Not committed. Stopping here for review.
