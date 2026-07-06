# Member Profile

```
Type: Project/Product (Member-facing transparency and participation interface)
Status: Substantially specified — architecture only; implementation not started
Version: 1.0
Extends/Reconciles with: brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md (Verification status,
  Privacy Rules), docs/source/academy/RPCS_LEVELS.md, docs/source/academy/RPCS_PROGRAM.md,
  docs/source/academy/RPCS_CERTIFICATION.md, docs/source/academy/CURRICULUM.md,
  docs/source/projects/COMMUNITY.md, docs/source/methodology/HARM_CODEX.md,
  docs/source/methodology/SCIENTIFIC_REVIEW.md, brain/MODULE_INDEX.md, docs/source/foundation/06_ECOSYSTEM.md,
  docs/source/governance/DATA_POLICY.md, docs/source/governance/DPIA.md,
  brain/DOMAIN/CORE_DOMAIN_MODEL.md (Person, Payment, Notification, ConsentRecord — LOCKED, referenced not modified)
```

## Member Profile Visibility

Membership Status is not only internal. Each member shall have access to a personal Member Profile Dashboard showing their own participation journey.

This section distinguishes clearly between three tiers:

**1. Member-facing information** — shown directly to the member, about themselves only. May include: Membership Status; Verification Status; Current Role; Community Pathway; Event Participation; Volunteer Contributions; Academy Progress; Certifications; Civic Portfolio; Mentorship Status; Fellowship Status; Next Recommended Steps.

**2. Internal administrative information** — never shown to the member; visible only to authorized staff/reviewers. Shall include: duplicate detection notes; reviewer comments; risk flags; governance referral reasoning; sensitive evidence notes; harm-related assessment notes.

**3. Governance-sensitive information** — never shown to the member as reasoning. **CODEX POTENTIAL** and **HEARING CANDIDATE** may be visible only if disclosure is safe, consent-based, and does not expose sensitive harm-related information.

**No member-facing profile shall display harm classification, evidence assessment, scientific review status, or governance decisions, unless explicitly approved by the relevant governance process.**

**Architectural Rule:** the member profile is a transparency and participation interface. **It is not a governance decision interface.**

Membership is not merged with Evidence Model, AHIP, Structured Hearings, Harm Codex, Scientific Review, or Repair Framework — this section only states what may and may not surface through the member-facing profile; it does not redefine, relocate, or gain authority over any of those documents' own data or decisions. Full detail on each tier's sourcing and rationale: Definitions and Framework, below.

## Purpose

Membership Status must not only be internal. Each member shall have access to a personal profile dashboard where they can see their own membership status, verification state, participation pathway, roles, contribution history, certifications, and next possible steps.

**The Member Profile is the member's personal operating system inside the Res Publica ecosystem — the member's navigation system through the civic ecosystem.** It is not merely a dashboard. It is not a profile page. It is not a social media page. It is not a governance interface.

The fundamental question it answers is **not** "What do you think?", **not** "How popular are you?", **not** "What is your score?", and **not** "How do you compare with other members?" **It answers only one primary question: "What should I do next?"** Every section inside the Member Profile ultimately supports answering this question.

It achieves this entirely by surfacing status, progress, and available actions from already-existing systems (Definitions, Dashboard Domains, below) — it does not become a second implementation of any of them.

**Architectural Rule — stated once, binding throughout this document:** the member profile is a transparency and participation interface. **It is not a governance decision interface.** It allows members to understand their participation journey, but it must not expose sensitive internal review logic or harm-related governance data.

## Mission

To give every member a clear, honest, self-facing view of their own participation journey — without exposing internal review deliberation, risk assessments, or harm-related governance data belonging to other processes.

## Dashboard Domains

**Reuse discipline, stated once:** every domain below displays status, progress, and available actions sourced from an already-existing system. None of these domains redesigns, relocates, or gains authority over the system it displays. Where a named system does not yet exist anywhere in this repository, this is stated explicitly rather than invented.

### Identity

Displays: Member ID, Ticket ID, Membership Number, Membership Status, Membership Type, Verification Status, Registration Date, Renewal Date, Active Community, Community Location, Languages, Contact Information, Privacy Preferences. Sourced from the `Person` entity and its related fields (`brain/DOMAIN/CORE_DOMAIN_MODEL.md` — LOCKED, referenced only) and the Membership System module (`brain/MODULE_INDEX.md` #4). Ticket ID reconciles with the Events module's (`brain/MODULE_INDEX.md` #14) registration reference — not a new ticketing concept.

### Membership Journey

Displays: Current Membership Status, Previous Status, Status History, Status Change Date, Triggering Activity, Next Available Status, Required Next Steps. Membership Status must always answer: *why do I currently have this status, and what must I do to reach the next one?* This is a read-only history/explanation view over Membership System's (`brain/MODULE_INDEX.md` #4) own status field — it does not define new status values or new transition logic; those remain Membership System's own.

**Required future addition — flagged, not invented here.** The future Membership System specification must define a full exit and deactivation lifecycle, at minimum distinguishing: (1) membership deactivation/inactivity, (2) temporary pause, (3) self-isolation, (4) voluntary withdrawal, (5) retirement, (6) suspension, (7) termination, and how each relates to the separate treatment of a member's documented contributions. This is not a defect in MEMBER_PROFILE — it is a genuine gap in Membership System's own not-yet-written specification, surfaced here because Membership Journey is the section that will eventually display it.

**Important distinction for that future specification — person-centered, not account-centered.** Membership represents civic participation and institutional memory, not a normal platform account. A person's membership state may change, but their documented contributions must not disappear from the civic record. Accordingly, **"Deleted" should not be used as a Membership Lifecycle term:**

```
Membership Lifecycle:  REGISTERED → VERIFIED → ACTIVE →
                        INACTIVE / PAUSED / SELF-ISOLATED / WITHDRAWN / RETIRED / SUSPENDED / TERMINATED
```

**Architectural principle — deliberately not a lifecycle definition:** *Documented civic contributions are permanent components of institutional memory. Their governance lifecycle is independent of the Membership Lifecycle. Membership state changes do not delete, invalidate, or remove documented contributions. Retention, archival, anonymization, transfer, preservation, and any future lifecycle rules remain the responsibility of the future Civic Contribution Framework (CCF), not MEMBER_PROFILE.* This document deliberately does not define a Contribution Record Lifecycle — doing so would create the same temporary-ownership problem just avoided for Membership. Ownership stays clean: Membership System owns the Membership Lifecycle; the future Civic Contribution Framework owns Contribution Governance; MEMBER_PROFILE only displays both, consistent with `RESPONSIBILITY_EVIDENCE_MODEL.md` §6's existing principle that a record is "retained (not deleted)... consistent with `AuditLog`'s append-only discipline."

**Why "Civic Contribution Framework," not "Contribution/Evidence Architecture":** Evidence is only one category of civic contribution — the canonical owner should eventually govern the complete lifecycle, governance, attribution, preservation, and recognition of all civic contributions, not evidence alone. Illustrative, non-normative examples of what its scope may eventually cover: Civic Participation, Volunteer Activities, Research Contributions, Academy Achievements, Mentoring, Publications, Dialogue Facilitation, Project Leadership, Community Service, Evidence Contributions, Repair Contributions. **This list is illustrative, not normative — MEMBER_PROFILE does not define these categories or their lifecycle.** Their canonical definition belongs to the future Civic Contribution Framework.

MEMBER_PROFILE.md does not define the Membership Lifecycle, nor any Contribution lifecycle, now — this note exists solely so the requirement is not lost before their respective canonical owners (Membership System; the Civic Contribution Framework) are specified.

### Membership Types

Reuses the existing Membership System architecture (`brain/MODULE_INDEX.md` #4). Displays the member's current type only: Basic, Supporter, Volunteer, Research, Institutional. **Gap, flagged not invented:** Membership System's own current specification (`06_ECOSYSTEM.md`, `MODULE_INDEX.md`) describes it only as "recurring individual/institutional financial support" and does not yet define this five-type taxonomy anywhere. This document displays whatever type Membership System eventually assigns — it does not create the taxonomy on Membership System's behalf.

### Community Participation

Displays: Communities Joined, Active Community, Local Community Lead, Facilitator, Organizer, Volunteer, Current Roles, Past Roles, Event Participation, Attendance History, Volunteer Hours, Community Contributions. Sourced from the Community module (`brain/MODULE_INDEX.md` #3, "tracks the visitor→participant ladder... as a rules engine, never ML-scored") and the Events module (#14). Roles named here (Facilitator, Organizer, Volunteer) are Community/Events-module roles, distinct from the HARM-methodology roles of the same name in `STRUCTURED_HEARINGS.md` — same words, different systems, not conflated here.

### Community Systems

Displays participation status only, in the following already-ratified modules (`brain/MODULE_INDEX.md`): **Community** (#3), **Membership System** (#4), **Fellowship System** (#5), **Academy** (#6), **Speech Academy** (#7), **Writing Academy** (#8), **News Analysis Lab** (#9 — the ratified name; not "News Analysis & Forecasting Lab"), **Research Lab** (#10), **Dashboard** (#16).

**For each, this profile displays only:** Current Status, Progress, Available Actions — never the module's own internal architecture, logic, or data model.

**Genuinely unratified — referenced, not invented:** AI Mentor, Skill Graph, Mentorship Platform, Career & Leadership Development, Volunteer & Project Marketplace, and Alumni Network do not appear anywhere in `brain/MODULE_INDEX.md`, `brain/BLUEPRINTS/master-product-blueprint.md`, or elsewhere in this repository. Per `06_ECOSYSTEM.md`'s own Governance rule ("Module additions... require an ADR"), these cannot be treated as existing systems here. They are named as a forward-looking wishlist only; this document defines no data, status, or behavior for any of them, and none should be built against this document alone. Certifications are handled separately, below, via the existing `RPCS_CERTIFICATION.md` — "Certification System" as a distinct module is likewise unratified.

### Contribution History

Displays: Activity Timeline, Volunteer Activities, Community Contributions, Projects, Events, Certificates, Academy Progress, Fellowships, Mentorship, Civic Portfolio. This is the same Civic Portfolio/Contribution view already specified above (Member Profile Visibility, Definitions) — sourced from `RESPONSIBILITY_EVIDENCE_MODEL.md` §4 (Contributor, Activity, Module, Community, Project, Date) — a descriptive timeline, never an aggregate score, consistent with that document's explicit prohibition on comparative or computed values.

### Application History

Displays submitted forms: Join Forms, Fellowship Applications, Volunteer Applications, Project Applications, Academy Applications. For every submission: Submission Timestamp, Ticket ID, Event Name, Event Date, Role, Participation Intention, Follow-up Status, Consent Status. Sourced from the Community and Events modules' existing application/registration flows (`brain/MODULE_INDEX.md` #3, #14) — this document does not define a new intake or application architecture; it displays the member's own submission history only.

### Evidence Summary

**Reaffirms, does not relax, the Explicit prohibition already stated above (Member Profile Visibility).** May display only: Evidence Submitted, Submission Status, Verification Status. **Shall never display:** Evidence Assessment, Scientific Review (status or outcome), Harm Classification, Reviewer Notes, Governance Reasoning, Risk Flags. Any Evidence Notes visible here are member-visible notes only — authored for the member, never internal reviewer notes surfaced by omission or by UI error. Sourced from `EVIDENCE_MODEL.md` and `SCIENTIFIC_REVIEW.md` only insofar as those documents already restrict what leaves their own boundary — this section adds no new access, only restates the boundary at the display layer closest to the member.

### Payments

Displays: Membership Fee, Donations, Supporter Contributions, Renewal Status, Payment History, Invoice History. Sourced from the `Payment` entity (`brain/DOMAIN/CORE_DOMAIN_MODEL.md` — LOCKED, referenced only) and the Membership System module (#4). This document does not define payment processing, invoicing logic, or financial data retention — those remain Membership System's and the Core Domain Model's own.

### Recommendations

This domain is superseded in detail by the Opportunity Engine (below), which is the authoritative, single specification of recommended-action content, fields, and wording rules — not duplicated here. In summary: Recommended Events, Recommended Academy Courses, Volunteer Opportunities, Fellowship Opportunities, Mentorship Opportunities, Community Opportunities. **Recommendations are informational only — they never represent governance decisions**, consistent with AI Integration (below): any AI-assisted recommendation is advisory, never autonomous, and never implies a harm-related or governance status.

### Notifications

Displays: Membership Notifications, Upcoming Renewals, Upcoming Events, Pending Applications, Pending Certificates, Community Messages. Sourced from the `Notification` entity (`brain/DOMAIN/CORE_DOMAIN_MODEL.md` — LOCKED, referenced only). This document does not define notification delivery mechanics.

## Civic Progression System

**Membership uses social-game-like progression logic, but it is not gamification.** The formal term for this logic is the **Civic Progression System** — the core logic connecting Activity, Role, Membership Status, Academy Progress, Contribution, Fellowship, Mentorship, and Community Leadership. It contains **no points, no public rankings, no leaderboards, no comparative member scores, and no automatic activity-count promotion.** Every progression step described below is milestone-based (met / not yet met) and human-confirmed, extending the exact pattern `RPCS_LEVELS.md` already established for Academy Levels ("completion is confirmed by a Facilitator at each level, never self-declared... no numeric score or rank is associated with level progression") to the rest of the member's civic journey. This is not a new mechanism invented here — it is the connective description of mechanisms that already exist independently in Membership System, Community, Academy, and Fellowship System.

**How activities create progression.** A verified Activity — a Responsibility Evidence record (`RESPONSIBILITY_EVIDENCE_MODEL.md` §4) with Verification status "Verified" — may count toward a milestone. Progression never derives from an activity *count* alone; it derives from a human reviewer recognizing a pattern of verified activity as sufficient, the same discipline `RPCS_LEVELS.md` already applies ("Progression... is sequential; completion is confirmed by a Facilitator... never self-declared").

**How verified participation changes Membership Status.** A pattern of verified activity may prompt a Membership Status review within Membership System's own existing workflow. This document does not define Membership System's status-transition rules — it only displays the outcome once Membership System's own process confirms it (Activity-to-Status Logic, below).

**How roles such as Volunteer, Facilitator, Organizer, and Local Community Lead become available.** Each such role requires human confirmation by the relevant module (Community for Volunteer/Facilitator/Organizer/Local Community Lead), never an automatic, count-triggered assignment. A role becoming *available* to be confirmed is not the same as a role being *granted* — the profile may show "eligible for consideration," never "unlocked" as an automatic system event. **Roles are not rewards — they are responsibilities.** Volunteer, Facilitator, Organizer, Local Community Lead, Mentor, and Fellow are presented as increasing civic responsibilities, never as increasing social status.

**How Academy progress connects to contribution.** `RPCS_LEVELS.md`'s existing binary Level completions (met / not yet met) may be one factor a human reviewer weighs when considering a member for a new role or Membership Status change — Academy progress is informative context for a human decision, never itself an automatic trigger.

**How volunteering connects to community trust.** "Trust" here reuses the exact, already-canonical definition in `docs/source/glossary/TERMS.md`: *"a qualitative civic property, never a numerical score. Never 'Reputation.'"* This document elaborates, without conflicting: Trust is not a property a member owns in isolation — it is best understood as an **emergent civic relationship**, built through repeated, meaningful, verified participation, not assigned or held statically. Trust is never displayed as a score, a percentage, or a ranking. Trust **may influence** eligibility (a human reviewer's qualitative sense of a member's trustworthiness for a role); Trust **never guarantees** progression.

**How Fellowship and Mentorship become advanced pathways.** Both remain exactly as already specified: Fellowship is the existing, human-gated Responsibility Community Fellowship (`COMMUNITY.md` — 40 Fellows paired with 22 Experts); Mentorship reuses RPCS Level 4, "Mentorship / Peer Review" (`RPCS_LEVELS.md`). Both are advanced pathways a member may become eligible for, confirmed by the owning process, never entered automatically.

**How Civic Portfolio documents progress.** The Civic Portfolio (Dashboard Domains → Contribution History, above) is a descriptive record of what a member has done — activities, roles held, Academy levels completed, Fellowship/Mentorship participation. It documents progression after the fact; it does not itself compute, score, or predict progression.

**Why progression is milestone-based, not score-based.** Consistent with Constitution Core Principle 2 (Zero Gamification) and `RESPONSIBILITY_EVIDENCE_MODEL.md` §9's explicit, binding prohibition on "Points, XP, Tokens, Credits, Leaderboards, Badges, Levels [as ranks], Ranks, Achievements, Reputation Scores, Social Scores, Competition" under any name or framing — a milestone is a qualitative, human-confirmed threshold ("this pattern of verified activity is sufficient"), never a numeric accumulation compared against a scale or against other members.

**Why the Member Profile displays progress but does not decide progression.** Consistent with the Architectural Rule already stated (Member Profile Visibility, above: "it is not a governance decision interface"), extended here specifically to progression: every progression decision — a Membership Status change, a role becoming available, a Fellowship or Mentorship acceptance — is made by the owning module's own human-confirmation process (Membership System, Community, Academy, Fellowship System respectively). **The Member Profile does not make governance or membership decisions. However, it is the primary participation interface through which members initiate activities, registrations, applications, learning pathways, volunteer work, mentorship requests, and community engagement** — not deciding is not the same as being passive; the profile is where a member actively acts, even though it never decides the outcome of that action.

### Civic Progression Loop

The member journey follows this loop:

```
Activity → Contribution → Documentation → Verification →
Qualitative Trust Building → Role Eligibility → Status Review → New Opportunities
```

This loop is not automatic. It is human-confirmed, milestone-based, and privacy-aware, consistent with every mechanism described above. The Member Profile displays the loop as guidance — it does not decide progression. "New Opportunities," the loop's own output, is what the Opportunity Engine (below) surfaces back to the member, closing the loop into the member's next action.

## Activity-to-Status Logic

A visible, member-facing status history, per status change: **Previous Status; Current Status; Status Change Date; Triggering Activity; Responsible Module** (which existing system confirmed the change — e.g., Membership System, Community, Academy, Fellowship System); **Validation Source** (the human-confirmation step that validated it, e.g., "confirmed by Facilitator," per the same pattern `RPCS_LEVELS.md` already requires); **Next Possible Status; Required Next Step.**

**Visibility, restated precisely for this section:**
- The member **may** see their own activity and contribution history.
- The member **may** see the member-facing reason for a status change — a plain-language explanation of the Triggering Activity and Validation Source, in member-facing language.
- The member **must never** see: internal reviewer notes, risk flags, evidence assessment, harm classification, scientific review status, or governance reasoning. This is the same Explicit prohibition already stated in Member Profile Visibility and Evidence Summary, above — restated here because Activity-to-Status Logic is the section most likely to be implemented as a literal audit-trail view, where an internal reviewer's raw note could otherwise leak into a "Triggering Activity" or "Validation Source" field by accident. The member-facing reason field must be authored as member-facing text, never a direct copy of an internal note.

## Opportunity Engine

The most important question in the Member Profile is not *"What do you think?"* It is *"What do I do next?"* **The Member Profile must not behave like a social media profile, opinion feed, or self-expression wall. It is a civic progression dashboard.** Its purpose is to guide the member toward meaningful next actions.

**Architectural Rule.** The Member Profile may display opportunities and recommended next steps. **It must never display social-media-style prompts** such as: "What do you think?"; "Share your opinion"; "Post your thoughts"; "React to this"; "Compete with others." Instead, it guides members through civic action: attend an event, join an academy course, complete a training step, volunteer for a project, submit a join form, apply for fellowship, request mentorship, mentor another member, join a research lab, join a community role, organize a local activity, renew membership, complete verification, update consent preferences, submit required documentation.

The Opportunity Engine is the action-guidance layer of the Member Profile. It translates the member's current Membership Status, verified activities, Academy progress, roles, certificates, Fellowship status, Civic Portfolio, community participation, and consent preferences into concrete next possible actions.

**It answers:** *"What can I do next?"* **It does not answer:** *"What is my score?" "What do others think of me?" "How do I compare with others?" "What opinion should I post?"*

**The Opportunity Engine may display:** Next Recommended Action; Available Events; Available Courses; Volunteer Opportunities; Fellowship Opportunities; Mentorship Opportunities; Research Participation; Community Leadership Opportunities; Required Verification Steps; Renewal Actions; Pending Applications; Missing Documents; Consent Updates; Project Invitations; Certification Pathways.

**For every opportunity, display:** opportunity title; responsible module; why this is available; required next step; deadline, if any; consent requirement, if any; application or registration link; expected outcome; whether it affects Membership Status, Role, Certificate, Fellowship, or Civic Portfolio.

**Visibility rule — the reason shown to the member must be member-facing and safe.** It may say: *"This opportunity is available because you completed the Basic Academy pathway."* It must never say: *"Internal reviewer marked you as low risk." "Governance review flagged you as hearing candidate." "Evidence assessment suggests harm relevance." "Scientific Review has classified your case."* This is the same Explicit prohibition already stated throughout this document, applied here to opportunity-reason text specifically.

**Opportunity is not approval.** The Member Profile may show that an opportunity is available. **It must never imply that the member is already approved, selected, promoted, certified, or accepted.**

**Allowed:** "You may apply for Fellowship." "You are eligible to request mentorship." "You can register for the next Speech Academy session." "You can submit your volunteer interest for Project X."

**Not allowed:** "You are accepted as Fellow." "You have earned leadership status." "You are officially trusted." "You are selected for governance review."

Every opportunity displayed here is sourced from the already-existing owning module (Community, Academy, Speech Academy, Fellowship System, Membership System, Research Lab, Events) named in Dashboard Domains and Civic Progression System, above — the Opportunity Engine does not decide eligibility, it surfaces eligibility that the owning module has already determined, in civic-action language rather than raw system state.

**Opportunity language.** Every recommendation is action-oriented, built from verbs: Register, Apply, Join, Complete, Continue, Renew, Learn, Volunteer, Mentor, Organize, Participate, Contribute. It avoids passive wording, social-media wording, popularity wording, motivational language, and engagement-optimization language. The interface guides participation — it never attempts to maximize screen time.

## Personal Civic Roadmap

The Personal Civic Roadmap is the navigation layer of the Member Profile. It visualizes the member's current civic journey.

**The roadmap always displays:** Current Position; Completed Milestones; Active Milestones; Available Opportunities; Locked Opportunities; Future Pathways; Optional Pathways; Required Prerequisites; Responsible Module; Recommended Next Milestone.

**The roadmap is personal.** It is never comparative, never predictive, never competitive, and never ranks members. It simply visualizes the member's own civic journey — the same self-facing-only, non-comparative discipline already established in Core Principles, below, applied here to navigation specifically.

**The roadmap never displays every possible path.** It dynamically displays only pathways currently relevant to that specific member. Example:

```
Current Position
    ↓
Verified Participant
    ↓
Available Opportunities
    ↓
Volunteer · Speech Academy · Research Lab
    ↓
Required Milestone
    ↓
Complete Volunteer Orientation
    ↓
Next Possible Role
    ↓
Facilitator
```

**Status vocabulary:** Completed; In Progress; Available; Locked; Future; Expired; Waiting for Validation; Waiting for Approval.

**Every locked pathway is explained in member-facing terms.** It may say: *"Research Lab is currently unavailable because the Academy Foundation pathway has not yet been completed."* It must never say: *"Access denied."*

The Roadmap is a presentation layer over the same status/progress/eligibility data already defined in Dashboard Domains, Civic Progression System, and the Opportunity Engine — it introduces no new eligibility logic, only a navigational visualization of what those sections already establish.

## Opportunity Dependency Model

The Opportunity Engine does not generate opportunities arbitrarily. **Every opportunity originates from one or more existing systems. The Opportunity Engine is a presentation layer over existing ecosystem modules**, not an independent source of truth. This dependency is documented explicitly, not left implicit:

```
Membership System → Membership Status → Opportunity Engine → Volunteer Opportunities
Community → Participation History → Opportunity Engine → Organizer Opportunities
Academy → Completed Learning Pathways → Opportunity Engine → Advanced Courses
Research Lab → Research Participation → Opportunity Engine → Research Projects
Fellowship System → Fellowship Status → Opportunity Engine → Mentorship Opportunities
Certification (RPCS_CERTIFICATION.md) → Completed Certifications → Opportunity Engine → Leadership Opportunities
Events → Attendance → Opportunity Engine → Upcoming Activities
Consent (ConsentRecord, Core Domain Model — LOCKED) → Privacy Settings → Opportunity Engine → Eligible Invitations
Applications (Community/Events application flows) → Pending Requests → Opportunity Engine → Required Actions
```

**Architectural Rule.** The Opportunity Engine never owns any data. It never creates eligibility. It never changes status. It never grants access. It never approves applications. It never evaluates members. **It only translates existing ecosystem state into understandable civic actions.**

## Member Journey Lifecycle

**This is the same loop as the Civic Progression Loop (above), shown at whole-journey scale, not a second, independent lifecycle.** The Civic Progression Loop is the repeating engine (Activity → ... → New Opportunities); Member Journey Lifecycle places that engine inside the member's full arc, from first Identity to ongoing re-engagement — the middle segment (Contribution → Documentation → Verification → Trust Building → Role Eligibility → Status Review) is identical in substance to the Progression Loop's own middle segment, deliberately, not by coincidence. There is one authoritative progression mechanism, described here twice at two zoom levels — not two mechanisms.

```
Identity → Membership → Participation → Contribution → Documentation →
Verification → Trust Building → Role Eligibility → Membership Status Review →
Opportunity Generation → Next Civic Action → New Participation
```

This is a continuous loop. It never ends while membership is active — "New Participation" feeds back into Participation/Contribution, re-entering the Civic Progression Loop's own cycle.

## Human-Centered Navigation

The purpose of the Member Profile is to reduce uncertainty. When a member opens their profile they should immediately understand: Where am I? What have I completed? What is waiting? What can I do today? What should I prepare next? What opportunities are currently available? What is blocking my next step? **The system exists to answer these questions clearly.**

**Final architectural constraint.** The Member Profile does not redesign existing modules, duplicate architecture, or invent governance, academy, fellowship, community, research, or event logic — every domain, roadmap entry, and opportunity above reuses an already-existing module. **The Member Profile is the integration layer of the ecosystem. It orchestrates visibility, navigation, participation, and progression. It owns none of the underlying business logic.**

## Membership Compliance

Membership is not activated solely by registration. Every member must complete the required compliance requirements before becoming an active participant in the ecosystem. The Member Profile displays the member's compliance status.

**Required Compliance — completion status displayed for:** Membership Agreement; Code of Conduct; Community Principles; Privacy Policy; Data Protection Information (GDPR / DSGVO); Data Processing Consent; Participation Consent; Media Consent (if applicable); Research Consent (if applicable); AI Interaction Consent (if applicable); Event Participation Consent; Volunteer Agreement (if applicable); Fellowship Agreement (if applicable). None of these documents is created, hosted, or defined by this document — each is a real legal/policy artifact whose content and validity remain owned by `docs/source/governance/DATA_POLICY.md`, `docs/source/governance/DPIA.md`, and the `ConsentRecord` entity (`brain/DOMAIN/CORE_DOMAIN_MODEL.md` — LOCKED, referenced only).

**Status vocabulary:** Completed; Pending; Expired; Requires Renewal; Withdrawn; Not Applicable.

**Membership Activation.** Registration alone does not activate membership. Membership becomes operational only after the required compliance documents have been completed according to the Membership System's own rules. The profile distinguishes three states: **Registered → Compliance Complete → Membership Active.** This document does not define Membership System's own activation rules — it displays the outcome once Membership System's own process confirms it, the same reuse discipline already applied throughout Civic Progression System, above.

**Consent Management.** Members can always: review their consent history; update consent preferences; withdraw optional consent; download accepted agreements; view agreement versions; view acceptance timestamps. Each of these is a display/action surface over the existing `ConsentRecord` entity and `DATA_POLICY.md`'s existing consent rules — not a new consent-management mechanism.

**Architectural Rule.** The Member Profile never decides whether consent is legally valid. It only displays compliance information managed by the responsible Membership and Governance systems.

**Opportunity Engine integration.** The Opportunity Engine considers compliance requirements before presenting an opportunity. It may say: *"This opportunity is unavailable because the required Data Processing Consent has not yet been completed."* It must never say: *"You are blocked."* — consistent with the Opportunity Engine's existing member-facing, safe-reason rule, above.

**Roadmap integration.** The Personal Civic Roadmap includes compliance milestones whenever they are prerequisites for progression. Example:

```
✓ Privacy Policy accepted
✓ Data Processing Consent completed
✓ Membership Agreement signed
✓ Volunteer Agreement completed
    ↓
Volunteer opportunities become available.
```

**GDPR Principle.** Consent is not a one-time event. The profile indicates when a consent requires renewal because of: policy updates; legal changes; consent withdrawal; new processing purposes. This reuses `DATA_POLICY.md`/`DPIA.md`'s existing consent-lifecycle rules — it does not define new renewal logic.

**Privacy by Design.** The Member Profile never exposes sensitive personal data beyond what is necessary for the member to understand their own compliance status.

**Do not redesign GDPR architecture; reuse existing governance and data-protection documents.** The Member Profile only visualizes compliance. **It never owns compliance logic. It never validates legal consent. It never replaces the legal documents.**

## Core Principles

1. **Self-facing only** — a member sees their own record; never another member's, and never a comparison against another member's (consistent with Zero Gamification, Core Principle 2, and `RESPONSIBILITY_EVIDENCE_MODEL.md`'s existing prohibition on aggregate totals, scores, percentiles, or ranks).
2. **Transparency, not governance** — the profile explains status; it does not make, preview, or imply a governance decision.
3. **Consent-based disclosure** — any status touching the HARM pipeline (Codex Potential, Hearing Candidate) is shown only with the member's consent and only as an opaque status, never with underlying reasoning.
4. **Strict tri-tier visibility separation** — member-facing, internal-administrative, and governance-sensitive information are architecturally distinct tiers, never merged into one view or one data object exposed wholesale.
5. **No gamification** — no points, badges, streaks, leaderboards, or progress-bars-framed-as-scores, consistent with the Constitution and `RESPONSIBILITY_EVIDENCE_MODEL.md` §9 Forbidden Concepts, applied identically here.

## Definitions

**The three visibility tiers** are defined in Member Profile Visibility, above — not repeated here. This section adds sourcing detail and rationale for each field named there.

**Member-facing field sourcing:** Verification Status reuses `RESPONSIBILITY_EVIDENCE_MODEL.md`'s existing tri-state Verification status pattern (Submitted/Verified/Rejected-equivalent, never a numeric score); Academy Progress reuses `RPCS_LEVELS.md`'s existing binary met/not-yet-met levels, not a score; Certifications per `RPCS_CERTIFICATION.md`; Civic Portfolio is the member's own Contribution/Responsibility Evidence history per `RESPONSIBILITY_EVIDENCE_MODEL.md` §4 — a descriptive list, never an aggregate score; Mentorship Status reuses RPCS Level 4, "Mentorship / Peer Review"; Fellowship Status per `COMMUNITY.md`'s Responsibility Community Fellowship.

**Internal-only field sourcing** (never shown to the member, under any circumstance, through this interface): duplicate detection notes (`BASIC_VALIDATION_FRAMEWORK.md`'s Duplicate Detection); reviewer comments (any Reviewer role's working notes, across Responsibility Mapping, Harm Codex, Responsibility Annexes, Scientific Review); risk flags (`EARLY_WARNING.md`'s Risk Assessment dimensions); governance referral reasoning (Scientific Review's Governance Review Gates deliberation, Ethics Board veto reasoning); sensitive evidence notes (`EVIDENCE_MODEL.md`'s Evidence Assessment, Contradiction Management records); harm-related assessment notes (Harm Classification, National Harm Taxonomy category assignment). None of these is redefined here — this document only states that they must not surface through the member profile.

**CODEX POTENTIAL and HEARING CANDIDATE, detail:** shown only if all three conditions hold: disclosure is safe (no re-traumatization or exposure risk), the member has consented to seeing this status, and the disclosure does not expose any sensitive harm-related information. Where shown, these are **status-only** — "your account may be relevant to X" — never accompanied by the harm classification, evidence assessment, scientific review status, or governance reasoning that produced the flag. Consistent with `HARM_CODEX.md`'s existing "explanation only, no data" public-disclosure principle, extended here to a narrower, consent-gated, member-specific disclosure — not a relaxation of that principle.

**Explicit prohibition (restated for emphasis):** this is a default-closed rule, not a default-open one requiring an opt-out.

## Framework

**Data sourcing, by tier:**
- Member-facing fields are sourced from: `RESPONSIBILITY_EVIDENCE_MODEL.md` (Verification status, Activity/Contribution records — private fields already, per that document's §6 Privacy Rules, visible to "the Contributor and authorized staff only" — this profile is that Contributor-facing view), `RPCS_LEVELS.md`/`RPCS_PROGRAM.md`/`RPCS_CERTIFICATION.md` (Academy Progress, Certifications), `COMMUNITY.md` (Fellowship Status).
- Internal-administrative fields are sourced from, and remain owned by: Basic Validation Framework, Documentation Quality Review, Scientific Review, Harm Codex, Evidence Model, Early Warning — this document does not duplicate or relocate their data, only excludes it from the member-facing view.
- Governance-sensitive referral status (Codex Potential, Hearing Candidate) is sourced from the HARM pipeline but rendered here only as an opaque flag, per Definitions above.

**Relationship with Other Frameworks:** consumes (read-only, member-scoped) from `RESPONSIBILITY_EVIDENCE_MODEL.md`, `RPCS_LEVELS.md`, `RPCS_PROGRAM.md`, `RPCS_CERTIFICATION.md`, `COMMUNITY.md`. Does not consume from, and never displays, Basic Validation Framework, Documentation Quality Review, Scientific Review, Harm Codex, Evidence Model, or Early Warning's internal working data — only their approved, opaque status consequence where applicable (Codex Potential / Hearing Candidate). None of these is redefined here.

## Workflow

No new lifecycle stage is introduced into the HARM Lifecycle, Scientific Review's pipeline, or any Evidence-related workflow. The Member Profile is a read-only presentation layer over already-existing, already-governed data — it does not gate, approve, or alter any upstream process. Rendering a Codex Potential / Hearing Candidate flag requires an explicit governance-process approval event (per the Explicit prohibition, above) before the flag becomes visible — this approval step belongs to the relevant governance process (Scientific Review / Ethics Board), not to this document.

## Roles

**Member** — views their own profile only. **Platform Administrator** — technical maintenance of the profile interface, no access to elevate visibility tiers. Approval to surface a Codex Potential / Hearing Candidate flag rests with the relevant governance process (Scientific Review Committee / Ethics Board), not with any role defined in this document.

## Inputs

A member's own Identity, Membership, Verification, Community-participation, Contribution/Responsibility Evidence, Application, Payment, and Notification records, drawn from the already-existing systems named in Dashboard Domains, above; where applicable and approved, an opaque Codex Potential / Hearing Candidate flag.

## Outputs

A personal Member Operating Dashboard view, scoped to Member-facing information only (Definitions and Dashboard Domains, above).

## Governance

**Tri-tier visibility separation is a binding architectural constraint, not a configurable preference.** No implementation of this profile may merge the three tiers into a single queryable object exposed to the member-facing interface — internal-administrative and governance-sensitive data must be excluded at the data-access layer, not merely hidden in the UI. Subject to `docs/source/governance/DATA_POLICY.md` and `docs/source/governance/DPIA.md`'s existing data-protection requirements.

**Reaffirmed for the expanded scope:** the tri-tier separation and the "not a governance interface" rule apply identically across every Dashboard Domain, including Evidence Summary and Payments — expanding the profile's surface area does not create a new exception to either rule. **Governance architecture is not modified by this document; Membership is not merged with Evidence Model, Harm Codex, Structured Hearings, Scientific Review, or Repair Framework.** Any of the six unratified systems named in Community Systems (above) that later become real modules would require their own ADR per `06_ECOSYSTEM.md`'s Governance rule, at which point this document's own Dashboard Domains section — not this document's authority — would need a corresponding update.

## AI Integration

Not specified beyond the general AI Governance boundary (`docs/source/governance/AI_POLICY.md`). Any AI-generated "Next Recommended Steps" content is advisory only and must not infer or surface governance-sensitive information as a side effect (e.g., must not imply harm classification through recommendation phrasing).

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

Notification preferences; profile export; multilingual profile rendering; accessibility-adaptive profile layout.

## MVP Status

**Current Role:** Member-facing product feature. **Blocking Status:** Non-blocking for the core HARM pipeline — this is a presentation layer, not a governance module. **Implementation Priority:** Not yet assigned a phase. **Current Requirement:** architecture specified (this document); implementation has not started — no profile UI, data-access layer, or tier-separation enforcement exists yet in this repository.

## TODO (implementation — not started)

- [ ] Design the data-access layer enforcing tier separation at the query level, not just the UI level.
- [ ] Define the exact approval workflow for surfacing a Codex Potential / Hearing Candidate flag.
- [ ] Define consent-capture UX for Codex Potential / Hearing Candidate disclosure.
- [ ] Integrate with `RESPONSIBILITY_EVIDENCE_MODEL.md`'s existing Contributor-facing private-field visibility (§6).
- [ ] Define "Next Recommended Steps" generation logic (human-authored templates vs. AI-assisted, per AI Integration above).
- [ ] Build the Identity, Membership Journey, and Membership Types views over the existing Membership System and Core Domain Model `Person` entity.
- [ ] Build the Community Participation and Community Systems status/progress/actions views over the existing Community, Fellowship, Academy, Speech Academy, Writing Academy, News Analysis Lab, and Research Lab modules.
- [ ] Build the Application History view over the existing Community/Events application and registration flows.
- [ ] Build the Payments and Notifications views over the existing `Payment` and `Notification` entities.
- [ ] **Blocking on Membership System, not on this document:** once Membership System defines its exit/deactivation lifecycle (Membership Lifecycle: REGISTERED/VERIFIED/ACTIVE/INACTIVE/PAUSED/SELF-ISOLATED/WITHDRAWN/RETIRED/SUSPENDED/TERMINATED — never "Deleted"; see Membership Journey, above), update this document's display of those states. Do not invent this lifecycle here in the meantime.
- [ ] **Blocking on the future Civic Contribution Framework (CCF), not on this document:** once the CCF defines its own governance lifecycle for documented contributions (retention, archival, anonymization, transfer, preservation, recognition) across all civic contribution categories (not evidence alone), update this document's display accordingly. MEMBER_PROFILE deliberately does not define a Contribution Record Lifecycle, contribution categories, or their governance — only the principle that Membership state changes never delete, invalidate, or remove documented contributions (see Membership Journey, above).
- [ ] If AI Mentor, Skill Graph, Mentorship Platform, Career & Leadership Development, Volunteer & Project Marketplace, or Alumni Network are ever ratified as real modules (via their own ADR), integrate each explicitly here rather than assuming this document already covers them.

## References

`brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md`; `docs/source/academy/RPCS_LEVELS.md`; `docs/source/projects/COMMUNITY.md`; `docs/source/methodology/HARM_CODEX.md`; `brain/MODULE_INDEX.md`; `docs/source/foundation/06_ECOSYSTEM.md`

## Related Documents

`../../brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md` · `../academy/RPCS_LEVELS.md` · `../academy/RPCS_PROGRAM.md` · `../academy/RPCS_CERTIFICATION.md` · `../academy/CURRICULUM.md` · `COMMUNITY.md` · `../methodology/HARM_CODEX.md` · `../methodology/SCIENTIFIC_REVIEW.md` · `../governance/DATA_POLICY.md` · `../governance/DPIA.md` · `../../brain/MODULE_INDEX.md` · `../foundation/06_ECOSYSTEM.md`
