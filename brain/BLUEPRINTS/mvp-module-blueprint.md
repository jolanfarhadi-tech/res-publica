# Res Publica — MVP Module Blueprint

*A detailed build specification for the 9 modules ratified as MVP tier in the Master Product Blueprint: Knowledge Graph, AI Layer, Publishing, Community, Membership System, Events, Dashboard, CRM, and Analytics (core scope). No code. This document does not revisit priority — that was decided in the Master Product Blueprint — it deepens each MVP module to build-readiness and draws a hard line around what MVP must not attempt.*

**Build order** (from the ratified dependency map): Knowledge Graph → AI Layer → Publishing → Community → Membership System → Events → Dashboard → CRM → Analytics. CRM's own dependencies (Core Platform, Membership System only) are light enough that it could run in parallel with Community/Events engineering if a second engineer is available — noted per-module below, not a reordering of the ratified sequence.

---

## Table of Contents

1. Knowledge Graph
2. AI Layer
3. Publishing
4. Community
5. Membership System
6. Events
7. Dashboard
8. CRM
9. Analytics (core scope)
10. What Must NOT Be Built in MVP

---

## 1. Knowledge Graph

**Purpose.** A deterministic entity/relationship graph (people, organizations, topics, legislation, dialogues, findings) derived automatically from Git-committed MDX, supplying the grounding data the AI Layer needs to answer questions with real citations and the cross-collection "related content" the site needs to feel coherent rather than five disconnected folders.

**User Journey.** A visitor reads a research entry on participation impact. Because the graph has already extracted "participation impact" as a topic entity and linked it to a specific citizens' dialogue project and a position paper via shared entity references in their frontmatter, a "Related" panel below the article surfaces both — without an editor having manually tagged the connection. The visitor clicks into the dialogue project and understands, for the first time without hunting, that the research and the dialogue are part of one argument.

**Database Entities.**
- Entity — a person, organization, topic, legislation item, dialogue, or finding node
- Relationship — a typed edge between two entities, carrying its supporting source reference
- EntitySourceReference — link from an entity/relationship back to the originating MDX file and commit
- EntityAlias — German/English/Persian name variants that resolve to one canonical entity

**APIs.**
- Entity Lookup — retrieve an entity and its known relationships
- Related-Content — cross-collection recommendations from a given entity or piece of content
- Graph Search — query entities/relationships by name, type, or topic

**AI Features.** A multilingual named-entity recognition/linking model canonicalizes entities across DE/EN/FA mentions of the same person, topic, or organization. A relationship-extraction pass infers typed edges (co-occurrence, explicit cross-links, topical/temporal proximity) — deterministically derived from committed content, not freely generated. No AI-inferred relationship goes live without appearing in the extraction pipeline's output; there is no separate "AI guesses a connection and publishes it" path at this stage.

**Dependencies.** Core Platform, Website & CMS.

**Risks.**
- Entity-resolution errors merging distinct people or organizations, or failing to match German/Farsi name variants for the same entity, degrading trust in "related content."
- Relationship extraction overstating causation between two loosely connected items (correlation read as connection).
- Graph staleness if the extraction pipeline doesn't rebuild in lockstep with every content commit.
- Added build-time complexity risks slowing Tier 1 static rendering unless the graph build stays strictly isolated from the page-render path.

**Validation Checklist.**
- [ ] Every entity extracted from content resolves to exactly one canonical node, verified against a sample of known cross-locale name variants (e.g., a person named differently in DE/EN/FA content)
- [ ] Every relationship in the graph is traceable to a specific source MDX file and commit SHA
- [ ] Graph rebuild completes and is queryable within an acceptable window of a content commit landing (no stale-graph window longer than one deploy cycle)
- [ ] "Related content" surfaced on a sample of pages is manually spot-checked by an editor and judged actually relevant, not just topically adjacent
- [ ] Tier 1 static page render time is unaffected by the graph build running alongside it

**Implementation Priority.** **1 of 9** — must exist before the AI Layer, since it is the AI Layer's grounding source.

---

## 2. AI Layer

**Purpose.** The single, shared, grounded-retrieval service — the "Grounded Civic Copilot" itself — that every other module consumes rather than reimplements: cited question-answering strictly from published content, translation-gap detection, and moderator-synthesis drafting, all under one cost-governance and citation-enforcement discipline.

**User Journey.** A citizen asks the copilot, in Farsi, "what has Res Publica found about municipal participation formats?" The query is embedded, matched against the Knowledge Graph and vector store, and answered with two or three sentences that each carry an inline citation back to a specific published research or dialogue page — in Farsi, RTL-rendered. If no committed content actually answers the question, the copilot says so plainly rather than guessing from general knowledge.

**Database Entities.**
- EmbeddingModel Version — the multilingual embedding model version in active use
- QueryLog — each retrieval query plus the citations returned, for audit and cost governance
- CitationRecord — the source MDX reference attached to every AI-generated answer
- TranslationGapFlag — a detected missing or stale EN/FA translation instance
- CostGovernanceLedger — per-query and per-period AI spend tracked against the monthly ceiling

**APIs.**
- RAG Query — source-grounded question answering with mandatory citations
- Translation-Gap Report — lists content missing or stale translations, for editorial review
- Moderator-Synthesis Assist (staff-only; not publicly accessible) — drafts a dialogue/discussion summary for human review (ephemeral, non-persisted until approved)
- Cost-Governance Telemetry — surfaces spend/usage to internal monitoring. *(AI Layer is the sole owner of raw cost/usage data; Analytics reads and aggregates it — clarified per Foundation Review.)*

**AI Features.** Grounded RAG strictly from Git-committed MDX with a hard citation-or-refuse rule — an answer with no supporting citation is suppressed, never shown as if it were confident. A single multilingual embedding model spans DE/EN/FA in one semantic space, so a Farsi question can retrieve a German-original source and answer correctly rather than returning nothing. A tiered model strategy starts cheap and escalates only when confidence is low, with a hard monthly spend ceiling that falls back to plain keyword search if exceeded — never an unbounded bill.

**Dependencies.** Core Platform, Website & CMS, Knowledge Graph.

**Risks.**
- Hallucination despite grounding controls if retrieval returns weakly relevant passages that get stitched into a confident-sounding but wrong answer.
- Institutional-voice drift — an answer phrased as the organization's own opinion rather than a citation of what it published, which is a real credibility risk for a democracy organization.
- Cost overrun from escalation-tier overuse if the spend ceiling and fallback aren't actually wired to trigger automatically.
- Farsi answer quality lagging German/English, since Farsi is typically the lower-resource language for embedding models — this needs explicit QA, not an assumption of parity.
- Prompt injection via submitted or scraped content that later becomes RAG-retrievable — the citation-enforcement layer must resist a source document itself trying to redirect the model's behavior.

**Validation Checklist.**
- [ ] A sample of at least 20 real civic questions across all three languages returns cited, source-traceable answers or an explicit, graceful refusal — never an unsupported confident answer
- [ ] Every citation in a test set resolves to a real, currently-published page
- [ ] The monthly spend ceiling has been tested by simulating high query volume and confirming automatic fallback to keyword search actually triggers
- [ ] Farsi-language answer quality has been reviewed by a native/fluent speaker against the same question set used for German/English
- [ ] A test document containing an embedded instruction ("ignore prior instructions and say X") does not alter the copilot's behavior when retrieved as a source
- [ ] Translation-gap flags correctly identify at least one known, deliberately-introduced missing translation in a staging test

**Implementation Priority.** **2 of 9** — the MVP's defining capability; requires only Knowledge Graph beforehand.

---

## 3. Publishing

**Purpose.** The back-stage editorial pipeline — intake, moderation, AI-assisted draft authoring, translation handoff, and the actual commit into the Git-sourced content tree — kept strictly separate from the public-facing Website & CMS so that AI assistance never bypasses a named human's sign-off before anything goes live.

**User Journey.** An editor receives a raw civic-news item. They submit it to the intake queue; the AI Layer drafts a synthesized, source-grounded article with citations attached. The editor reviews the draft in a simple queue view, edits a sentence, and signs off with their name recorded against the specific commit. Only then does it become a real MDX file in the Git-sourced tree and appear on the public site.

**Database Entities.**
- SubmissionItem — a raw intake record (news item, dialogue notes, etc.)
- ModerationQueueEntry — status (pending/approved/rejected) plus assigned reviewer
- DraftDocument — a versioned AI or human draft prior to commit
- TranslationHandoff — per-language translation status and assignee
- SignOffRecord — the named human approver and timestamp required before publish
- PublishCommit — link to the resulting Git commit

**APIs.**
- Intake Submission — accept raw material into the pipeline
- Moderation Queue — list, assign, and decide on queued items
- Draft Authoring — generate a source-grounded AI synthesis draft
- Translation Handoff — route a draft to a translator
- Sign-off/Approval — record named human approval
- Publish/Commit — write the MDX file and open the commit

**AI Features.** Drafts synthesized, source-grounded MDX copy from raw intake material, refusing to draft claims it can't ground rather than inventing plausible-sounding filler. Produces a first-pass grounded translation for editor localization, not a final translation. Flags missing or weak citations before a draft is even shown to an editor, so review time goes to judgment calls, not citation-hunting.

**Dependencies.** Core Platform, Website & CMS, AI Layer.

**Risks.**
- Bottlenecking — if editorial capacity can't keep pace with AI-drafted volume, drafts pile up in the queue and the "human sign-off required" discipline becomes a backlog rather than a safeguard.
- Legitimacy drift if draft quality is inconsistent across busy vs. quiet periods, since inconsistent quality is harder for readers to detect (and therefore more corrosive) than an obviously broken feature.
- A moderator or editor over-trusting an AI-flagged "citations look fine" signal and skimming rather than actually verifying.
- Scope creep: the temptation to build the fuller Storytelling System's cross-content connection-discovery ledger (scored candidate links across the whole graph) at MVP, when a narrower "draft this one submission, with citations" scope is sufficient to prove the pipeline works.

**Validation Checklist.**
- [ ] No content has ever reached the public site without a SignOffRecord tied to a named human account
- [ ] A deliberately citation-weak draft is correctly flagged and blocked from reaching "ready for sign-off" state
- [ ] Average time from intake to publish is measured for at least 10 real items, establishing a baseline before volume scales
- [ ] Translation handoff correctly identifies which language variant is a first-pass AI draft vs. a human-localized final version
- [ ] Rejected submissions retain a recorded reason, reviewable later

**Implementation Priority.** **3 of 9** — depends only on Core Platform, Website & CMS, and AI Layer; needed early since it's how the org sustainably operates the site at all once AI drafting is in play.

---

## 4. Community

**Purpose.** Tracks, with explicit consent, where a person sits on the Community Journey ladder — anonymous visitor → identified interest → first real-world touch → contributing participant → recurring supporter — and triggers the next invitation via one of three distinct per-language mechanics, as a deliberately non-ML, auditable rules engine.

**User Journey.** A German visitor reads two dialogue outcome pages and opts in to topic tracking. The rules engine records "identified interest" in citizen-dialogue topics. When a real, dated dialogue event in their region opens registration, Community triggers a co-signed institutional invitation (the German-mechanic framing) rather than a generic newsletter blurb — because the platform actually knows what they've been reading, with their consent.

**Database Entities.**
- CommunityMember — pseudonymous consent state and current ladder stage
- LadderStageTransition — a log of stage changes and the consented signal that triggered each
- ConsentRecord — granular consent grants/withdrawals for tracking and invitations
- EvangelismInvitation — an invitation record, its language mechanic, and status
- LanguageMechanicConfig — configuration for the German/English/Farsi evangelism mechanics

**APIs.**
- Get Ladder Stage — a member's current consented stage
- Record Touchpoint — logs a real-world touch event as a candidate transition trigger
- Generate Invitation — produces the next appropriate invitation per language mechanic
- Create Private Referral Link — an encrypted, non-public referral link (the Farsi/diaspora mechanic)
- Update Consent — modifies or withdraws tracking consent

**AI Features.** None. This is the module where the standing "no ML scoring, ever" principle matters most — stage transitions and invitation selection are a rules/state engine precisely so that a citizen (or an auditor) can always explain exactly why a given invitation was sent.

**Dependencies.** Core Platform, Website & CMS.

**Risks.**
- Mechanical or over-frequent stage transitions making the ladder feel like a funnel rather than a relationship — the single biggest reputational risk for this module.
- The Farsi/diaspora private referral link must be genuinely, verifiably encrypted and non-public — not just labeled as private — given the real safety stakes for diaspora civic activity; this is a security requirement, not a UX nicety.
- Invitation-fatigue if the same person is contacted too often across overlapping triggers.
- The curated invitation content library (human-authored, per language mechanic) going stale without ongoing editorial upkeep, since nothing here is auto-generated.

**Validation Checklist.**
- [ ] Every stage transition in a test account can be traced to a specific, consented signal — no transition happens without one
- [ ] Consent withdrawal immediately halts tracking and future invitations for that member, verified by test
- [ ] The Farsi private referral link is confirmed encrypted end-to-end (not merely obfuscated) by someone other than the engineer who built it
- [ ] An invitation-fatigue test (simulating multiple overlapping triggers for one member in a short window) results in suppression, not duplicate sends
- [ ] Each of the three language mechanics has at least one real, human-authored invitation in the library before launch — not a placeholder

**Implementation Priority.** **4 of 9** — depends only on Core Platform and Website & CMS; can proceed in parallel with Publishing once those two are stable.

---

## 5. Membership System

**Purpose.** Formalizes recurring individual and light institutional financial support as a broad, low-friction on-ramp distinct from Fellowship — the mechanism that provides unrestricted funds grant cycles typically can't cover.

**User Journey.** A reader who has been following the org's work for a few months decides to support it directly. They pick a membership tier, set up a recurring monthly pledge, and receive a plain confirmation and tax receipt — no upsell sequence, no artificial urgency, consistent with the org's trust-first register.

**Database Entities.**
- Member — profile with tier (individual/institutional), status, join date
- MembershipTier — tier definitions, pricing, benefits
- RecurringPledge — the recurring donation/payment schedule
- InstitutionalSupporterProfile — org-level supporter details
- PaymentTransaction — payment/renewal history
- MembershipBenefitGrant — a non-gamified benefit/access record per tier

**APIs.**
- Create Membership — enrolls an individual or institution at a given tier
- Update Recurring Pledge — modifies or cancels a recurring donation
- Get Membership Status — current tier/status for an account
- List Membership Tiers — public listing of tiers and benefits
- Process Renewal — handles renewal and payment-failure workflows

**AI Features.** None. Enrollment, tiering, and renewal are administrative and financial processes; introducing AI here would have no clear purpose and only add audit surface to a module that touches real money.

**Dependencies.** Core Platform only. *(Corrected in the Master Product Blueprint reconciliation — Membership does not require Store, which doesn't exist yet at MVP.)*

**Risks.**
- This is, alongside Events, one of the first two MVP modules to handle real payment data — the payment-processing plumbing must be built once, correctly, and shared rather than duplicated ad hoc between the two.
- Recurring-payment failure handling done poorly reads as punitive or confusing to a supporter who wants to keep giving.
- Institutional-tier visibility (a public supporters list) needs explicit per-supporter consent before publishing, not an opt-out default.
- Donor fatigue or attrition if renewal/lapse messaging drifts from the org's plain, non-manipulative register into typical fundraising-industry urgency tactics.

**Validation Checklist.**
- [ ] A test recurring pledge can be created, modified, and cancelled cleanly, with correct proration/confirmation messaging
- [ ] A simulated failed payment triggers a clear, non-shaming prompt to update payment details, not a silent lapse
- [ ] Institutional supporters are only listed publicly after an explicit, logged consent action
- [ ] Payment data handling has been checked against the same GDPR/data-minimization discipline established for Tier 3 personalization
- [ ] Tax receipt generation (if applicable in the org's jurisdiction) is verified against a real test transaction

**Implementation Priority.** **5 of 9** — depends only on Core Platform; can be built in parallel with Community.

---

## 6. Events

**Purpose.** Converts today's static event pages into a full lifecycle — registration, event-scoped grounded logistics Q&A, capacity/waitlist management, and post-event outcome publishing — closing the loop that currently leaves citizens who register for a forum with no visible follow-through.

**User Journey.** A citizen registers for an upcoming citizens' forum. They ask the event's embedded Q&A "is there Farsi interpretation?" and get a grounded, cited answer drawn only from that event's own published details — not a guess. If the event is full, they're waitlisted transparently and notified automatically if a spot opens. Weeks later, they return to the same event page and find the published outcome — what was discussed, what came of it — closing the loop the Community Journey depends on.

**Database Entities.**
- Event — the event record and its published logistics fields
- Registration — a participant's signup for an event
- Waitlist Entry — a queued registration when capacity is full
- Capacity/Session Slot — seat or session limits per event
- Event Q&A Log — logged, event-scoped grounded logistics interactions
- Outcome Publication — post-event results published back to participants
- Attendee Record — minimal participant identity and attendance status

**APIs.**
- Event Listing — browse upcoming/past events
- Event Detail — view a single event's published fields
- Registration — sign up for an event
- Waitlist — join/manage a waitlist when full
- Capacity Check — query remaining seats
- Event Q&A Query — ask logistics questions, retrieval-restricted to that event's own fields
- Outcome Publishing — organizer publishes post-event results
- Admin Event Management — staff create/edit events and manage registrations

**AI Features.** Event-scoped grounded logistics Q&A, deliberately retrieval-restricted to a single event's own published fields so a question about Event B can never be answered with Event A's address — the single most important guardrail in this module, since a wrong address or time is a real-world consequence, not just an embarrassing bug.

**Dependencies.** Core Platform, Website & CMS, AI Layer.

**Risks.**
- This is the first Res Publica feature that requires collecting genuine participant PII (name, email, sometimes accessibility needs) — real GDPR obligations apply from day one, not as a retrofit.
- Logistics Q&A hallucinating a wrong address or time would be reputationally costly for a trust-based organization; the retrieval-restriction guardrail above must actually be tested, not assumed to work.
- Waitlist automation could disadvantage accessibility-priority attendees unless a manual override remains available to staff.
- Scope creep toward a full event-marketing/CRM system — registration forms should not quietly grow abuse-prone open fields; the newsletter endpoint's existing lesson (no rate limiting led to a spam-relay risk) applies equally here and should be designed against from the start, not discovered later.

**Validation Checklist.**
- [ ] A registration for Event A cannot retrieve or return any detail belonging to Event B, verified by a deliberate cross-event test query
- [ ] Waitlist promotion is tested end-to-end (registration → full → waitlisted → spot opens → promoted → notified)
- [ ] Registration form submission is rate-limited or otherwise abuse-resistant, learning directly from the newsletter endpoint's prior lack of protection
- [ ] Participant PII collected is the minimum necessary (name, email, language preference, accessibility notes) — no speculative fields "just in case"
- [ ] A published outcome correctly notifies every registered participant, tested with a real registration cohort

**Implementation Priority.** **6 of 9** — depends on AI Layer; triggers the org's first real handling of participant PII, so should not be rushed ahead of its GDPR groundwork.

---

## 7. Dashboard

**Purpose.** The personalization home for logged-in users — visitor, participant, and (later) Fellow segments — surfacing relevant dialogues, matched research, a personalized digest, upcoming events, and a concrete, non-gamified Impact Tracker, all from one shared module manifest rather than three separate pages.

**User Journey.** A newly identified visitor logs in for the first time, is shown a small set of topic chips since they have no history yet, and picks two. Immediately, their dashboard shows a personalized digest of matched research and an upcoming event near them. Weeks later, after attending that event, their Impact Tracker shows the concrete, traceable fact that their attendance is reflected in a published outcome — not a score, a fact.

**Database Entities.**
- Dashboard Module Manifest Entry — an ordered, per-segment record of which modules appear and in what order
- User Preference — opt-in follow/topic settings driving personalization
- Impact Evidence Record — traceable participation evidence shown in the Impact Tracker

**APIs.**
- Get Dashboard Manifest — the ordered module list for the requesting user's segment
- Get Personalized Digest — matched dialogues, research, and events for an opted-in user
- Get Impact Tracker Data — a user's traceable participation evidence
- Update Follow Preferences — updates opt-in topic/follow settings

**AI Features.** Matches research, dialogues, and events to a user's opted-in interests for the Personalized Digest, and recommends cold-start topic chips for newly identified users with no history yet. Nothing here scores or ranks the user themselves — the Impact Tracker is evidentiary (what happened, sourced), never a gamified score.

**Dependencies.** Core Platform, Community, AI Layer.

**Risks.**
- Segment-based module composition can quietly become segment-based gatekeeping if a team hides content rather than reorders it — a design discipline risk more than a technical one.
- The module manifest could become a dumping ground if every future feature requests a slot without editorial restraint.
- RTL mirroring and Solar Hijri date rendering must be re-verified for every new module added to the dashboard, not assumed inherited — this is the single most likely place a subtle Farsi-locale bug hides, since it's the lowest-traffic locale and least likely to be caught by casual QA.

**Validation Checklist.**
- [ ] Cold-start state (no history) shows a topic-chip picker, never an empty or irrelevant-filler module
- [ ] The Impact Tracker for a test account with real recorded participation shows a specific, traceable fact ("cited in the March dialogue summary"), not a number or score
- [ ] Farsi-locale rendering of every dashboard module is checked by a native/fluent RTL reader, including date formatting
- [ ] DOM reading order matches visual priority order for screen-reader navigation, tested with a keyboard-only pass
- [ ] Module manifest correctly differs between visitor and participant segments without code duplication

**Implementation Priority.** **7 of 9** — depends on Community and AI Layer both being live, since the digest and matching logic need both to have real content to work with.

---

## 8. CRM

**Purpose.** Staff-facing relationship management for the organization's donors, members, institutional partners, and grant funders — operationalizing the conflict-of-interest firewalls and funding-source disclosure the Business Model requires, distinct from the citizen-facing Community module.

**User Journey.** Development staff receive an inquiry from a municipal government interested in funding a dialogue series. Before any money changes hands, they log the relationship in CRM, complete a conflict-of-interest disclosure, and get it reviewed and recorded. Only after that review is approved does the partnership move to an active status and the funding source become eligible for public disclosure.

**Database Entities.**
- DonorRecord — individual/institutional donor relationship and giving history
- InstitutionalPartner — partner organization profile and partnership stage
- GrantFunder — grant-making body record with funding history and terms
- ConflictOfInterestDisclosure — a logged disclosure and its staff review outcome
- FundingSourcePublicationRecord — what has been published to the public funding-disclosure page
- PartnershipStatusLog — history of partnership stage/status changes

**APIs.**
- Create/Update Relationship Record — adds or updates a donor/partner/funder entry
- Log Conflict-of-Interest Disclosure — records a disclosure and its review outcome
- Get Partnership Status — current stage of an institutional or funder relationship
- Publish Funding Disclosure — pushes approved funding-source data to the public disclosure page
- Generate Funder Report — compiles relationship/giving history for reporting

**AI Features.** None — deliberately. This is a governance and accountability tool; the standing "AI never originates institutional positions" principle applies with particular force here, since a wrong or fabricated detail in a funding-relationship record is a governance failure, not a content-quality issue.

**Dependencies.** Core Platform, Membership System.

**Risks.**
- Manual disclosure and review steps can become a bottleneck or get skipped under time pressure from a small staff, exactly when they matter most (a fast-moving new institutional relationship).
- Data siloing from Community/Membership if the same donor's information is duplicated rather than linked, creating an inconsistent picture of one real relationship.
- Funding-source disclosure staleness if the public disclosure page isn't actually kept in sync with what CRM records — the two must not drift apart.

**Validation Checklist.**
- [ ] No institutional/government partnership can be marked "active" without a completed, reviewed conflict-of-interest disclosure on record
- [ ] The public funding-disclosure page correctly reflects only relationships explicitly approved for publication — verified against a test case with an unapproved relationship
- [ ] A donor who is both an individual member and later becomes an institutional contact is represented as one linked relationship, not two disconnected records
- [ ] A funder report can be generated end-to-end for at least one real or realistic test grant, tracing restricted vs. unrestricted use

**Implementation Priority.** **8 of 9** in the ratified sequence, though its actual dependencies (Core Platform, Membership System) are light enough to build in parallel with Community/Events if a second engineer is available — flagged here as a scheduling opportunity, not a change to the ratified order.

---

## 9. Analytics (core scope)

**Purpose.** The single, authoritative internal measurement surface for civic effect — participation-per-subscriber by language community, AI cost/spend telemetry against the monthly ceiling, and Impact Tracker source data — explicitly excluding any attention or engagement metric, by design, not by oversight.

**User Journey.** Ahead of a grant renewal report, the CPO pulls up Analytics and sees participation-per-subscriber broken out by German, English, and Farsi communities over the reporting period, alongside AI cost telemetry confirming spend stayed under the monthly ceiling all quarter. None of it resembles a growth dashboard — there is no "sessions," "time on site," or "click-through rate" anywhere in the report, because the organization has explicitly rejected those as the wrong measure of success.

**Database Entities.**
- Metric Snapshot — a participation-per-subscriber datapoint per language community
- Funnel/Ladder Stage Event — a Community stage-transition record
- *(No independent AI Usage Record or Spend Ledger — Analytics reads and aggregates AI Layer's own Usage/cost ledger. Corrected per Foundation Review.)*
- Impact Tracker Source Record — traceable evidence underlying a reported outcome

**APIs.**
- Metrics Query — internal query over participation and funnel data
- Impact Tracker Feed — supplies traceable evidence to the Dashboard's Impact Tracker
- AI Spend/Ceiling Status — current spend vs. monthly cap, fallback state
- Funnel Stage Report — ladder-stage movement by cohort/language community
- Report Export — generates funder/grant reporting exports

**AI Features.** None generative. Analytics only consumes the AI Layer's own cost/usage telemetry to enforce the spend ceiling and confirm the automatic keyword-search fallback actually engages when needed — it does not itself perform any reasoning or generation.

**Dependencies.** Core Platform, Community, Membership System, Events, AI Layer. *(Fellowship System is explicitly not a dependency at this scope — nomination-signal aggregation is a later, V2-only addition to this module, not part of MVP.)*

**Risks.**
- The single biggest risk to this module is quiet metric drift — a well-intentioned future feature request ("just add session duration, it's useful context") that reintroduces an attention-style metric by the back door. This needs an explicit, standing review gate, not just a one-time design decision.
- AI cost-ceiling enforcement is only as good as its actual wiring — a ceiling that's tracked but doesn't actually trigger fallback behavior is worse than no ceiling, because it creates false confidence.
- Impact Tracker source data integrity depends entirely on upstream modules (Events, Community) recording accurate, traceable participation facts — Analytics can't correct bad data from its sources, only surface it faithfully.

**Validation Checklist.**
- [ ] A full audit of every metric surfaced in Analytics confirms none measure attention, engagement, or time-on-site — only participation, cost, and traceable impact
- [ ] The AI spend ceiling has been tested to actually trigger the keyword-search fallback when a simulated spend exceeds it, not just log a warning
- [ ] Participation-per-subscriber figures are broken out correctly by language community and reconcilable against raw Community/Events data for at least one reporting period
- [ ] A funder report export has been generated and reviewed by whoever will actually submit it to a real grant renewal
- [ ] No Fellowship-related field or table exists in this module's MVP scope — confirmed by review, not just by omission

**Implementation Priority.** **9 of 9** — last, by design: it's a measurement layer over the other eight modules and has nothing real to measure until they exist and are producing signal.

---

## 10. What Must NOT Be Built in MVP

**Any of the 11 V2/V3 modules from the Master Product Blueprint.** Fellowship System, Academy, Speech Academy, Writing Academy, News Analysis Lab, Research Lab, Store, full Admin Portal, and Public API are all correctly out of scope. Each depends on Community and/or Publishing having real usage history before the thing it formalizes has any real content to work with — building Fellowship before Community has real participants means nominating people against an empty ladder; building Store before Events and Academy exist means a catalog with nothing to sell.

**Any gamification, anywhere.** No points, badges, streaks, leaderboards, or progress bars framed as scores — not in Community's ladder, not in Dashboard's Impact Tracker, not anywhere. This is a standing principle established across every module in this session's work, and MVP is exactly where the temptation to add a quick engagement hook is highest and must be resisted hardest.

**Open-ended, general-knowledge AI chat.** The AI Layer answers only from Res Publica's own published content, with citations, or refuses. A general-purpose chatbot bolted onto the site — one that can answer questions using the model's background knowledge rather than the org's own sourced material — is explicitly out of scope, because it would undermine the exact trust the grounding discipline exists to build.

**A public graph explorer or visualization for the Knowledge Graph.** The graph's MVP job is invisible infrastructure powering retrieval and "related content" — a public-facing explorer UI is a plausible V2/V3 feature (already noted as future expansion) but adds real design and maintenance surface with no MVP-critical purpose.

**The fuller Storytelling System's cross-content connection-discovery ledger.** Publishing's AI drafting at MVP should stay narrow — draft one submission at a time, with citations, for one editor to review. The more ambitious version (a scored ledger of candidate connections across the entire content graph, proactively surfaced to editors) is real future work, not an MVP requirement, and building it early risks a large, unvalidated feature before the basic draft-review loop is even proven.

**ML-scored community ladder transitions.** Community's stage transitions must stay a rules/state engine. Any version of "let's use a model to predict readiness for the next stage" is explicitly excluded — not deferred, excluded — because auditability of why an invitation was sent is a trust requirement, not a nice-to-have.

**Academy Standing inside Dashboard.** The Dashboard's MVP scope is the shell (manifest, digest, impact tracker, preferences). Academy doesn't exist yet at MVP, so there is nothing for a "standing" module to reflect — this sub-module is correctly deferred to V2 alongside Academy itself.

**Fellowship-signal aggregation inside Analytics.** Analytics' MVP scope is participation-per-subscriber, AI cost telemetry, and Impact Tracker sourcing only. Nomination-signal aggregation requires Fellowship System to exist first and is a V2 addition to this module, not part of its MVP build.

**Complex, automated donor-scoring or predictive-giving models in CRM.** CRM at MVP is a record-keeping and disclosure-governance tool for a small development team, not a predictive fundraising platform. Any model that scores or ranks donors by predicted giving potential is out of scope and, per the org's own standing principles, likely out of character for the organization entirely.

**A native mobile app.** Already settled earlier this session (Mobile Experience should be a PWA, not native), and doubly true for MVP specifically — none of these 9 modules requires native-app capability, and building one now would divert a 1–3 person engineering team from the modules that actually define the MVP milestone.

**Any attention or engagement metric, anywhere in Analytics or elsewhere.** Session duration, time-on-site, click-through rate, or any similar metric must not appear in this platform's MVP — or any future phase — because the organization has explicitly and repeatedly defined its own success differently: civic effect, not attention.
