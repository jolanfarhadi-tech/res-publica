# Res Publica — The Master Product Blueprint

*Ratified by the Executive Product Board (CEO, CTO, CPO, Chief AI Officer, Chief Experience Officer, Chief Community Officer, Chief Learning Officer, Chief Research Officer, Chief Business Officer, Lead Software Architect). This document organizes — it does not invent. Every module below is grounded in the Product Vision, Experience Blueprint, Operating System, Engineering Audit, Security Audit, and Implementation Plan already produced this session. This is the constitution of the platform: the complete product hierarchy, module by module, and the order in which it must be built.*

No code. Twenty modules. One dependency map.

---

## How to read this document

Each module specifies: Purpose, Primary Users, Dependencies, Connected Modules, Required Database Entities, APIs, AI Capabilities, User Journeys, Business Value, and Development Priority (Core / MVP / V2 / V3).

**Two corrections were made during board reconciliation**, since five independent drafting teams working in parallel produced two inconsistencies that a whole-system view must resolve:

1. **Membership System ↔ Store circularity.** Membership System was drafted with a dependency on Store (for payment plumbing); Store was drafted with a dependency on Membership System (for tier-based discount rules). Resolved: **Membership System depends only on Core Platform** (which owns shared payment/identity plumbing); **Store depends on Membership System**, not the reverse. A subscription/pledge relationship does not require a product catalog to exist first; a catalog referencing member discounts does require Membership to exist first.
2. **Analytics ↔ Fellowship System phase conflict.** Analytics (MVP) was drafted with a hard dependency on Fellowship System (V2), which is not buildable — an MVP-tier module cannot depend on a V2-tier module. Resolved: **Analytics' MVP scope** (participation-per-subscriber tracking, AI cost/spend telemetry, Impact Tracker sourcing) **does not depend on Fellowship System.** Fellowship nomination-signal aggregation is a **V2 addition to Analytics**, arriving alongside Fellowship System itself, not a blocker to Analytics shipping at MVP.

Standing principles governing every module (established earlier, never contradicted): AI may retrieve, translate, connect, and draft — never originate an institutional position or publish without a named human's sign-off. Zero gamification anywhere — no points, badges, streaks, or leaderboards. Personalization is opt-in, GDPR-disciplined, EU-resident; anonymous full-site use is always preserved. Success is measured by civic effect, never by attention or engagement.

---

## Table of Contents

1. Core Platform
2. Website & CMS
3. Community
4. Membership System
5. Fellowship System
6. Academy
7. Speech Academy
8. Writing Academy
9. News Analysis Lab
10. Research Lab
11. AI Layer
12. Knowledge Graph
13. Store
14. Events
15. Publishing
16. Dashboard
17. Admin Portal
18. Analytics
19. CRM
20. Public API
21. Dependency Map & Build Order

---

## 1. Core Platform

**Purpose.** The foundational substrate — the three-tier architecture (Static Core, AI Retrieval Layer, Personalization & Identity Layer) as shared infrastructure every other module builds on, including the engineering-audit hardening required before that trust is extended.

**Primary Users.** Engineers (direct); every other module as an infrastructure consumer; site visitors, indirectly, via reliability and performance.

**Dependencies.** None — the foundational layer all other modules depend on.

**Connected Modules.** Website & CMS, AI Layer, Public API, Admin Portal, Dashboard.

**Required Database Entities.**
- BuildCache Entry — cached rendered content, replacing the currently missing caching layer
- VectorStoreIndex — the Tier 2 embedding index derived from committed MDX
- IdentityAccount — opt-in, EU-resident identity record for Tier 3 personalization
- ConsentRecord — GDPR consent state tied to an IdentityAccount
- Session — token/state for an opted-in identified session

**APIs.**
- Content Read — cached, non-forced-dynamic access to MDX content
- Build/Health Status — verifies static rebuild integrity
- Identity Bootstrap — opt-in session/account creation (Tier 3)
- Consent Management — records and revokes GDPR consent

**AI Capabilities.** None directly — provides the vector-store/retrieval plumbing the AI Layer consumes; performs no reasoning itself.

**User Journeys.**
- Engineer ships a content change and gets a statically rebuilt page served from cache, no forced-dynamic regression.
- Anonymous visitor loads any page and gets a fast cached response with no personalization triggered.
- Returning opted-in visitor is recognized via an identified Tier 3 session.

**Business Value.** Fixing the known engineering-audit issues (dead duplicate locale-routing file, missing caching, needlessly forced-dynamic pages, zero test coverage) before other modules build on it prevents compounding rework for a lean 1–3 engineer team and keeps performance/reliability credible to a grant-funded, effect-not-attention mission.

**Development Priority.** **Core** — must be hardened first; every roadmap phase depends on this substrate existing and being trustworthy.

---

## 2. Website & CMS

**Purpose.** Renders the five content collections, cornerstone/orientation pages, and glossary to the public as a hardened, SEO-sound static/ISR site, applying the established Information Architecture and Design System.

**Primary Users.** General public visitors (DE/EN/FA); search engines and AI answer engines as indirect consumers; internal stakeholders verifying published output.

**Dependencies.** Core Platform.

**Connected Modules.** Publishing, AI Layer, Knowledge Graph, Analytics, Public API.

**Required Database Entities.**
- ContentCacheEntry — cached parsed-MDX result keyed by slug/locale
- GlossaryTerm — civic-terms entry, source for DefinedTerm schema
- StructuredDataRecord — generated/escaped JSON-LD payload per page
- LocaleRedirectMap — routing rules for DE-primary/EN/FA fallback resolution

**APIs.**
- Content Retrieval — fetch a single entry by allowlisted, sanitized slug (dynamicParams=false)
- Collection Index — static/ISR listing data for the five collection index pages
- Search Query — shared normalization used at build time and client-side (deduplicating the current split implementation)
- Structured Data — renders escaped JSON-LD for cornerstone/glossary pages
- Sitemap & Robots — locale-aware sitemap generation

**AI Capabilities.** Consumes (does not own) the AI Layer's RAG retrieval to power an on-site grounded/cited search surface; no independent generative capability.

**User Journeys.**
- Visitor finds a natively-written German cornerstone page via search, not a thin translated duplicate.
- Farsi-reading visitor reads an RTL-rendered event page with Solar Hijri dates.
- A researcher clicks a glossary term marked up with DefinedTerm schema and follows a cross-link to a related dialogue.

**Business Value.** The org's primary public-trust surface and the foundation every other module ultimately publishes through or is discovered via; hardening (caching, static/ISR, sanitized slugs, CSP/HSTS, structured data) directly protects grant/partner credibility and answer-engine trust.

**Development Priority.** **Core** — the already-live Tier 1 static site; its audit-driven hardening precedes any Tier 2/3 rollout.

---

## 3. Community

**Purpose.** Tracks (with consent) an individual's position on the Community Journey ladder — anonymous visitor → identified interest → first real-world touch → contributing participant → recurring supporter/advocate — and triggers the next appropriate invitation via three distinct per-language evangelism mechanics.

**Primary Users.** Anonymous and consenting visitors; per-language community leads and outreach staff; dialogue facilitators.

**Dependencies.** Core Platform, Website & CMS.

**Connected Modules.** Membership System, Fellowship System, Dashboard, Events, CRM.

**Required Database Entities.**
- CommunityMember — pseudonymous consent state and current ladder stage
- LadderStageTransition — log of stage changes and the consented signal that triggered each
- ConsentRecord — granular consent grants/withdrawals for tracking and invitations
- EvangelismInvitation — invitation record, language mechanic, and status
- LanguageMechanicConfig — configuration for the German/English/Farsi evangelism mechanics

**APIs.**
- Get Ladder Stage — returns a member's current consented stage
- Record Touchpoint — logs a real-world touch event as a candidate transition trigger
- Generate Invitation — produces the next appropriate invitation per language mechanic
- Create Private Referral Link — issues an encrypted, non-public referral link (Farsi/diaspora mechanic)
- Update Consent — modifies or withdraws tracking consent

**AI Capabilities.** None — the ladder is deliberately a rules/state engine, not ML-scored, so transitions and invitations stay auditable and non-manipulative.

**User Journeys.**
- A German visitor engages with research and receives a co-signed institutional invitation to a local dialogue.
- An English-speaking practitioner exports the toolkit methodology and is later invited to become a recurring supporter.
- A Farsi-speaking diaspora member receives a private, encrypted referral link to invite a trusted contact without public exposure.

**Business Value.** Converts anonymous readership into a durable, non-transactional participation pipeline feeding Membership and Fellowship, directly operationalizing the "participation-per-subscriber" KPI per language community — the growth model's core alternative to vanity-metric growth.

**Development Priority.** **MVP** — central to the per-language growth strategy from day one; consent-tracking depth expands as Tier 3 lands, but the ladder and evangelism mechanics must exist early.

---

## 4. Membership System

**Purpose.** Formalizes recurring individual giving and light institutional support as a broad-based, lower-friction financial relationship — distinct from Fellowship's deep, non-transactional contributor recognition — providing unrestricted funds grants typically can't cover.

**Primary Users.** Individual recurring donors/supporters; institutional supporter-tier organizations; membership and finance staff.

**Dependencies.** Core Platform. *(Corrected from the raw draft's "Core Platform, Website & CMS, Store" — see reconciliation note above; Membership does not require Store to exist.)*

**Connected Modules.** Community, Fellowship System, Store, CRM, Dashboard, Analytics.

**Required Database Entities.**
- Member — profile with tier (individual/institutional), status, join date
- MembershipTier — tier definitions, pricing, benefits
- RecurringPledge — recurring donation/payment schedule
- InstitutionalSupporterProfile — org-level supporter details
- PaymentTransaction — individual payment/renewal history
- MembershipBenefitGrant — non-gamified benefit/access record per tier

**APIs.**
- Create Membership — enrolls an individual or institution at a given tier
- Update Recurring Pledge — modifies or cancels a recurring donation
- Get Membership Status — returns current tier/status for an account
- List Membership Tiers — public listing of tiers and benefits
- Process Renewal — handles renewal and payment-failure workflows

**AI Capabilities.** None — enrollment, tiering, and renewal are administrative/financial processes.

**User Journeys.**
- A reader signs up for a recurring monthly membership and receives a tier confirmation and tax receipt.
- A small NGO enrolls as an institutional supporter, appearing (with consent) in a public supporters list.
- A lapsed member's payment fails and they're prompted to update it, with no shaming or gamified messaging.

**Business Value.** Directly operationalizes the need for unrestricted funds grants can't cover, diversifying revenue beyond grant cycles; a broad, low-friction on-ramp distinct from Fellowship, widening the base beneath the Community ladder's "recurring supporter" stage.

**Development Priority.** **MVP** — revenue diversification beyond grant funding is an early need; institutional-tier depth matures alongside CRM.

---

## 5. Fellowship System

**Purpose.** A deliberate, human-gated system recognizing the platform's deepest-tier contributors (dialogue facilitators, research reviewers, per-language community leads) as the top rung of the Community ladder — with no public leaderboard, badge, or score.

**Primary Users.** Staff nominators/reviewers; nominated Fellows; dialogue facilitators, research reviewers, per-language community leads.

**Dependencies.** Community, Core Platform.

**Connected Modules.** Membership System, Dashboard, Research Lab, Publishing, Academy, Speech Academy, Writing Academy, Admin Portal.

**Required Database Entities.**
- FellowNomination — staff-submitted nomination with qualitative rationale
- FellowProfile — approved Fellow's record and role type
- NominationSignal — qualitative + light quantitative inputs (explicitly not an auto-threshold score)
- FacilitatorRoster — internal-only roster of active facilitators
- BylineAttribution — links a Fellow to a published named byline

**APIs.**
- Submit Nomination — staff submits a candidate for review
- Review Nomination — approve/reject/request-more-info workflow
- Get Fellow Roster — internal listing of active Fellows/facilitators
- Get Fellowship Tab Data — private per-Fellow view of recognition status
- Attribute Byline — links a Fellow to a published piece

**AI Capabilities.** None — nominations are staff-reviewed from qualitative and light quantitative signals, never auto-thresholded; quantifying these signals risks becoming a de facto leaderboard and must be resisted.

**User Journeys.**
- A research reviewer is nominated after sustained substantive work, approved, and added to the internal facilitator roster.
- A Farsi-language community lead is quietly recognized as a Fellow, gaining a private Fellowship tab with no public score.
- A staff reviewer evaluates a nomination packet of qualitative notes without any auto-generated ranking.

**Business Value.** Sustains the volunteer/contributor backbone that Community and Academy programs depend on, reinforcing the trust-based brand by resisting extrinsic incentives, and strengthening the credibility base institutions and grant funders rely on.

**Development Priority.** **V2** — depends on Community's ladder being live with real participation history before a meaningful top rung can be identified.

---

## 6. Academy

**Purpose.** Structured, non-gamified civic-education module (courses, workshops, cohorts) building the facilitation, research-literacy, and civic-writing skills the rest of the platform depends on — parent umbrella to Speech Academy and Writing Academy, and the training pipeline feeding skilled candidates into Fellowship.

**Primary Users.** Prospective Fellows; citizens building civic literacy; researchers; community leads; external civic-organization staff attending paid methodology workshops.

**Dependencies.** Core Platform, Community, Fellowship System. *(Membership System is a soft dependency only for paid-workshop billing, routed through Store — not a hard blocker to Academy's core courses/cohorts.)*

**Connected Modules.** Speech Academy, Writing Academy, Research Lab, Publishing, Events, Store, Dashboard, AI Layer.

**Required Database Entities.**
- Course — a structured learning unit with topic, level, language
- Cohort — a scheduled, facilitated group run of a course
- Enrollment — link between a user (or external org contact) and a course/cohort
- Curriculum Module — an ordered unit of content + assessment within a Course
- Completion Record — evidence of finishing a course/cohort, feeding Fellowship eligibility (not a score)
- External Workshop Booking — a paid engagement where an external org purchases a methodology workshop

**APIs.**
- List Courses — available courses/cohorts by language, topic, level
- Enroll in Course — registers a user or external org contact
- Get Enrollment Status — a user's progress across enrollments
- Record Completion — marks a module/course complete
- Request External Workshop — intake for a paid methodology workshop request

**AI Capabilities.**
- Recommends next course/cohort based on Community Journey stage and opted-in interests
- Multilingual (DE/EN/FA) drafting assistance for curriculum materials — human sign-off required
- Cross-references completed modules against Fellowship role requirements to surface skill gaps

**User Journeys.**
- A citizen wanting to become a dialogue facilitator enrolls in a cohort, completes it, and becomes eligible for Fellowship consideration.
- A partner civic organization books a paid methodology workshop and sends staff to be trained.
- A researcher completes a civic-writing module and gains the skill to draft summaries for Publishing.

**Business Value.** Turns Fellowship's skill requirements into a repeatable pipeline instead of an ad hoc gate, and is a direct earned-revenue engine via paid methodology workshops for other civic organizations.

**Development Priority.** **V2** — Community and Fellowship System (which define the roles Academy trains toward) must already exist; becomes necessary once demand outpaces informal skill-vetting, not required to launch initial dialogues.

---

## 7. Speech Academy

**Purpose.** Sub-program of Academy training citizens and prospective Fellows in dialogue facilitation and public-speaking/deliberation skills, so they can run or productively participate in citizen dialogues and forums.

**Primary Users.** Prospective Fellowship facilitators; citizens planning to attend/lead dialogues; per-language community leads.

**Dependencies.** Core Platform, Community, Fellowship System, Academy.

**Connected Modules.** Academy, Writing Academy, Fellowship System, Community, Events, Dashboard.

**Required Database Entities.**
- Facilitation Course — a Course scoped to dialogue/deliberation skills
- Practice Session — a supervised practice dialogue/forum, distinct from a live public event
- Facilitator Skill Assessment — a human reviewer's structured evaluation (human-gated)
- Facilitation Readiness Record — outcome feeding Fellowship facilitator-role eligibility

**APIs.**
- List Facilitation Courses — available Speech Academy courses/cohorts
- Schedule Practice Session — books a learner into a supervised practice dialogue
- Submit Facilitator Assessment — records a human reviewer's evaluation
- Get Facilitation Readiness — whether a learner meets Fellowship facilitator criteria

**AI Capabilities.**
- Drafts structured feedback prompts for human reviewers assessing a practice session (assistive only)
- Suggests practice-session topics matched to a learner's stated growth areas
- None for skill scoring — assessment is strictly human-gated

**User Journeys.**
- A citizen completes a Speech Academy course, runs a supervised practice session, and is assessed ready to facilitate a real citizen dialogue.
- A prospective Fellow builds deliberation confidence before their first forum appearance.

**Business Value.** The direct skill pipeline for Fellowship's facilitator role and Community's real-world touchpoints — without it, the org depends on informally trained facilitators, limiting safe dialogue volume.

**Development Priority.** **V2** — depends on Academy and Fellowship System's facilitator-role definition already existing; a priority once dialogue volume creates a facilitator bottleneck.

---

## 8. Writing Academy

**Purpose.** Sub-program of Academy training researchers, citizens, and Fellows in civic writing — research summaries, position statements, storytelling explainers — feeding the per-language re-narration work and the Research Lab/Publishing pipeline.

**Primary Users.** Researchers; prospective research reviewers; citizens interested in civic writing; Fellows drafting storytelling explainers.

**Dependencies.** Core Platform, Community, Fellowship System, Academy.

**Connected Modules.** Academy, Speech Academy, Research Lab, Publishing, AI Layer, Dashboard.

**Required Database Entities.**
- Writing Course — a Course scoped to research summaries, position statements, or storytelling explainers
- Writing Exercise — a drafting assignment tied to a Writing Course module
- Editorial Review — a human editor's structured feedback on a learner's draft (human-gated)
- Writing Readiness Record — outcome feeding Fellowship reviewer-role eligibility and Publishing's contributor pool

**APIs.**
- List Writing Courses — available courses/cohorts by skill track
- Submit Writing Exercise — records a learner's draft for review
- Submit Editorial Review — records a human editor's feedback and pass/needs-work outcome
- Get Writing Readiness — whether a learner may contribute to Research Lab review or Publishing

**AI Capabilities.**
- Draft-stage writing assistance and style feedback aligned to per-language voice (DE precise, EN comparative, FA trust-first)
- Suggests Writing Course modules based on a learner's target contribution
- None for grading — editorial pass/fail is strictly human-gated

**User Journeys.**
- A researcher completes a Writing Academy track on research summaries and becomes eligible to support Research Lab's review pipeline.
- A citizen learns civic-writing fundamentals and later drafts a storytelling explainer a named human editor signs off on.

**Business Value.** Supplies the scarce civic-writing skill the storytelling re-narration work and Research Lab/Publishing pipeline depend on, converting a talent bottleneck into a trained, repeatable pipeline.

**Development Priority.** **V2** — depends on Academy and Fellowship System already existing; needed once storytelling/publishing volume exceeds organically available trained contributors.

---

## 9. News Analysis Lab

**Purpose.** An applied media-literacy and fact-checking capability that verifies and contextualizes civic news before publication, and can be offered outward as a teaching tool for critical news analysis.

**Primary Users.** Editors/moderators (internal verification); Fellows; public visitors/learners.

**Dependencies.** Core Platform, AI Layer, Website & CMS, Publishing.

**Connected Modules.** Knowledge Graph, Fellowship System, Academy, Research Lab.

**Required Database Entities.**
- NewsItemAnalysis — fact-check/verification record tied to a news collection entry
- TranslationGapFlag — detected DE/EN/FA discrepancy in a news item
- CitationVerificationResult — per-claim source-check outcome
- ConnectionSuggestion — AI-proposed link from a news item to related research/policy, pending human confirmation
- LearnerExercise — instance of a public/Fellow-facing media-literacy exercise

**APIs.**
- Analysis Request — submit a news draft/URL for AI-assisted fact-checking
- Translation-Gap Check — compare language versions for inconsistency
- Citation Verification — validate claims against sourced content
- Cross-Content Connection Suggestion — surface candidate news-to-research/policy links
- Public Exercise — serve a guided analysis exercise to visitors/Fellows

**AI Capabilities.**
- Detects translation gaps across DE/EN/FA versions of a news item
- Verifies claims against citable source content, flagging/refusing where ungrounded
- Discovers cross-content connections (news to research/policy) for human confirmation
- Guides public learners through a structured, source-grounded exercise rather than delivering a verdict

**User Journeys.**
- An editor runs an incoming draft through the Lab and catches a DE/EN translation gap before it publishes.
- A Fellow uses the public tool on a live news item and is shown primary sources plus related Research Lab studies instead of an opinion.
- A visitor completes a self-guided exercise on a real published item and learns to check sourcing.

**Business Value.** Differentiates Res Publica as a trust-building civic institution rather than just a publisher, strengthens grant narratives around media-literacy/democracy education, and opens an Academy/Fellowship teaching and workshop-revenue angle.

**Development Priority.** **V2** — depends on a mature AI Layer and an established Publishing pipeline; extends rather than founds the platform.

---

## 10. Research Lab

**Purpose.** A collaboration space where staff researchers, Fellows, and external academic partners produce studies that feed the Research and Publications collections.

**Primary Users.** Staff researchers; Fellows; external academic/institutional partners.

**Dependencies.** Core Platform, Website & CMS, Fellowship System, Publishing.

**Connected Modules.** Knowledge Graph, News Analysis Lab, CRM, Writing Academy.

**Required Database Entities.**
- ResearchProject — study record with contributors and status
- Contributor — staff/Fellow/external-partner role assignment on a project
- PartnershipAgreement — institutional partnership/licensing terms tied to a project
- DatasetOrSourceRecord — underlying research materials and citations
- ManuscriptDraft — versioned draft prior to Publishing handoff

**APIs.**
- Project Creation — start a new research project
- Collaboration Management — add/manage contributors
- Dataset/Source Attachment — attach underlying materials and citations
- Manuscript Draft — manage draft versions
- Publishing Handoff — send a finished study into the Publishing pipeline
- Partnership/Licensing Record — track institutional agreements tied to a project

**AI Capabilities.**
- Surfaces related existing content via Knowledge Graph/Search during project scoping
- Grounded literature/cross-reference discovery limited to the Git-committed corpus
- Manuscript drafting assistance under the same "AI draft = pull request" human sign-off standard
- Citation-integrity checking before handoff

**User Journeys.**
- An external academic partner joins a project, contributes a dataset, and co-authors a study handed to Publishing.
- A staff researcher searches the Knowledge Graph inside the Lab to find prior related publications before drafting new work.
- A Fellow completes a research collaboration and is published under named authorship.

**Business Value.** Directly operationalizes the earned-research-revenue and institutional-partnership lines, strengthens grant competitiveness through visible research output, and gives Fellowship a concrete collaborative production venue.

**Development Priority.** **V2** — requires Fellowship System and a working Publishing pipeline already in place; a value-add layer built once core content/editorial infrastructure is stable.

---

## 11. AI Layer

**Purpose.** The cross-cutting AI service — grounded RAG/copilot, translation-gap detection, moderator-synthesis assist, multilingual embeddings, cost governance, and citation enforcement — consumed by every other module rather than reimplemented per module.

**Primary Users.** Site visitors (copilot/search); moderators (synthesis assist); editorial staff (translation-gap alerts); engineers (cost-governance monitoring).

**Dependencies.** Core Platform, Website & CMS, Knowledge Graph.

**Connected Modules.** Community, Publishing, Admin Portal, Dashboard, Public API, Knowledge Graph, Events, News Analysis Lab.

**Required Database Entities.**
- EmbeddingModel Version — tracked version of the multilingual embedding model in use
- QueryLog — retrieval query plus citations returned, for audit and cost governance
- CitationRecord — source MDX reference attached to each AI-generated answer
- TranslationGapFlag — detected missing or stale EN/FA translation instance
- CostGovernanceLedger — per-query/per-period AI spend tracked against budget

**APIs.**
- RAG Query — source-grounded question answering with mandatory citations
- Translation-Gap Report — lists content missing or stale translations
- Moderator-Synthesis Assist (staff-only; not publicly accessible) — drafts a dialogue/discussion summary for human review
- Cost-Governance Telemetry — surfaces spend/usage to Admin Portal. *(AI Layer is the sole owner of raw cost/usage data; Analytics reads and aggregates it, and maintains no independent ledger — clarified per Foundation Review.)*

**AI Capabilities.**
- Grounded RAG strictly from Git-committed MDX; refuses rather than improvises when no source exists
- Translation-gap detection across DE/EN/FA
- Moderator-synthesis drafting (human-gated, never auto-published)
- Multilingual embeddings with enforced cost governance

**User Journeys.**
- A visitor asks the copilot a question and gets a cited answer sourced only from published MDX, or an explicit refusal.
- An editor sees a translation-gap flag on a German page and drafts the missing English version.
- A moderator receives an AI-synthesized dialogue summary and signs off before it's published.

**Business Value.** Delivers Res Publica's central AI value proposition — grounded, citation-backed, trustworthy answers — as one shared service, avoiding duplicated AI integration cost and enforcing the "AI draft = pull request" governance principle consistently.

**Development Priority.** **MVP** — this is the "Grounded Civic Copilot" that defines the MVP milestone; built once Core Platform and Knowledge Graph exist.

---

## 12. Knowledge Graph

**Purpose.** A deterministic entity/relationship graph (people, orgs, topics, legislation, dialogues, findings) derived from Git-committed MDX, powering both RAG retrieval grounding and cross-collection recommendations.

**Primary Users.** AI Layer (grounding consumer); Recommendation Engine; site visitors (search/related content); editorial/research staff (graph curation review via Admin Portal).

**Dependencies.** Core Platform, Website & CMS.

**Connected Modules.** AI Layer, Research Lab, News Analysis Lab, Publishing, Public API.

**Required Database Entities.**
- Entity — a person, organization, topic, legislation item, dialogue, or finding node
- Relationship — deterministic typed edge between two entities, with source MDX reference
- EntitySourceReference — link from an entity/relationship back to originating Git-committed MDX
- EntityAlias — multilingual name variants (DE/EN/FA) for a single entity

**APIs.**
- Entity Lookup — retrieve an entity and its known relationships
- Related-Content — cross-collection recommendations from a given entity or piece of content
- Graph Search — query entities/relationships by name, type, or topic

**AI Capabilities.** None — relationships are derived deterministically from Git-committed MDX, not AI-inferred; the graph supplies the grounding data the AI Layer consumes.

**User Journeys.**
- A visitor reading a dialogue page sees related legislation and prior findings surfaced via the graph.
- The AI Layer resolves a query by traversing entity relationships to find and cite the correct source MDX.
- A researcher browses the graph to find all findings linked to a topic across languages.

**Business Value.** Turns scattered MDX content into a navigable, trustworthy knowledge structure that improves both AI grounding accuracy and on-site discovery, supporting the effect-not-attention mission by connecting visitors to substantive related content.

**Development Priority.** **MVP** — required as grounding infrastructure for the Grounded Civic Copilot; expands in V2 as more entity types (dialogues, contributions) come online.

---

## 13. Store

**Purpose.** A deliberately modest commerce module selling event/workshop tickets, paid Academy courses, purchasable/downloadable publication editions, and methodology-licensing packages — operationalizing earned-revenue lines without becoming a general e-commerce platform.

**Primary Users.** Public visitors and members (ticket/course/report buyers); institutional partners (methodology-license buyers); Admin/Finance staff.

**Dependencies.** Core Platform, Membership System, Events, Academy, Publishing.

**Connected Modules.** Membership System, Events, Academy, Publishing, CRM, Analytics, Admin Portal.

**Required Database Entities.**
- Product — a sellable unit (ticket, course seat, report edition, or license package)
- Order — a completed or in-progress purchase transaction
- Order Line Item — individual product(s) within an order
- Payment Record — payment/transaction confirmation tied to an order
- Price/Discount Rule — pricing, including membership-tier discounts
- License Grant — record of a methodology-licensing package sold to a partner
- Digital Delivery Asset — downloadable file released post-purchase

**APIs.**
- Catalog Listing — browse available tickets, courses, editions, and license packages
- Product Detail — view a single product's price, description, and availability
- Checkout/Order Creation — submit a purchase
- Payment Confirmation Webhook — reconcile payment provider callbacks
- Order History — buyer views past purchases
- Digital Access/Download — deliver purchased editions or license materials
- Admin Catalog Management — staff create/edit/retire products

**AI Capabilities.** None — a transactional module; any support content it displays reuses the AI Layer's existing grounded Q&A rather than introducing new capability.

**User Journeys.**
- A prospective attendee buys a paid workshop ticket and receives confirmation with access details.
- A researcher purchases a downloadable edition of the annual report.
- A partner civic organization licenses a methodology toolkit.

**Business Value.** Directly converts earned-revenue lines (event/workshop revenue, publication sales, methodology licensing) into a working transactional system, diversifying nonprofit income beyond grants while explicitly avoiding ad-driven dynamics.

**Development Priority.** **V2** — earned-revenue diversification is secondary to validating core participation; depends on Events, Academy, and Publishing already producing sellable content.

---

## 14. Events

**Purpose.** Converts static event pages into a full participation lifecycle — registration, event-scoped grounded logistics Q&A, capacity/waitlist management, and post-event outcome publishing that closes the loop back to the participant.

**Primary Users.** Prospective and registered event participants; event organizers and Admin staff.

**Dependencies.** Core Platform, Website & CMS, AI Layer.

**Connected Modules.** Website & CMS, AI Layer, Store, CRM, Analytics, Community.

**Required Database Entities.**
- Event — the event record and its published logistics fields
- Registration — a participant's signup for an event
- Waitlist Entry — queued registration when capacity is full
- Capacity/Session Slot — seat or session limits per event
- Event Q&A Log — logged grounded logistics interactions, scoped to the event
- Outcome Publication — post-event results/outcomes published back to participants
- Attendee Record — participant identity and attendance status

**APIs.**
- Event Listing — browse upcoming/past events
- Event Detail — view a single event's published fields
- Registration — sign up for an event
- Waitlist — join/manage a waitlist when full
- Capacity Check — query remaining seats
- Event Q&A Query — ask logistics questions, retrieval-restricted to that event's own fields
- Outcome Publishing — organizer publishes post-event results
- Admin Event Management — staff create/edit events and manage registrations

**AI Capabilities.**
- Event-scoped grounded logistics Q&A, retrieval-restricted to one event's own fields to prevent cross-event hallucination
- Mandatory citations on every AI-generated answer
- AI never originates institutional positions
- No predictive/recommendation AI — consistent with zero gamification

**User Journeys.**
- A prospective participant registers for a workshop and is automatically waitlisted if it's full.
- An attendee asks the event Q&A "where do I park" and gets a grounded, citation-backed answer limited to that event's details.
- A participant returns after the event to read the published outcome.

**Business Value.** The first genuinely stateful, transactional feature — underpins the participation-per-subscriber KPI, feeds Store's ticket revenue and Analytics' participation signals, and is the trigger for introducing Tier 3 and its real GDPR obligations.

**Development Priority.** **MVP** — the first feature requiring real participant data/PII, explicitly triggering the Tier 3 buildout, and the concrete proof of the org's dialogue-to-outcome mission.

---

## 15. Publishing

**Purpose.** The back-stage editorial production pipeline — intake, moderation, synthesis/draft authoring, translation handoff, and the commit/publish action into the Git-sourced content tree — distinct from the public rendering surface.

**Primary Users.** Editors, moderators, translators, named human sign-off approvers.

**Dependencies.** Core Platform, Website & CMS, AI Layer.

**Connected Modules.** News Analysis Lab, Research Lab, Knowledge Graph, Admin Portal, Writing Academy.

**Required Database Entities.**
- SubmissionItem — raw intake material record
- ModerationQueueEntry — status (pending/approved/rejected) plus assigned reviewer
- DraftDocument — versioned AI or human draft prior to commit
- TranslationHandoff — per-language translation status and assignee
- SignOffRecord — named human approver and timestamp, required before publish
- PublishCommit — link to the resulting Git commit/PR

**APIs.**
- Intake Submission — accept raw material into the pipeline
- Moderation Queue — list, assign, and decide on queued items
- Draft Authoring — generate a source-grounded AI synthesis draft
- Translation Handoff — route a draft to a translator
- Sign-off/Approval — record named human approval
- Publish/Commit — write MDX and open the Git commit/PR

**AI Capabilities.**
- Drafts synthesized, source-grounded MDX copy from raw intake, refusing rather than improvising where ungrounded
- Drafts cross-content narrative connections (Storytelling System) for human review
- Produces first-pass grounded translations, flagged for human localization review
- Flags missing/weak citations prior to sign-off

**User Journeys.**
- An editor receives a raw civic news submission, gets an AI-drafted synthesized article with citations, edits it, signs off, and it commits to the live site.
- A translator receives a handoff for a German cornerstone update, gets a grounded first-pass translation, localizes it, and signs off.
- A moderator rejects a queued community submission for lacking sourcing.

**Business Value.** Turns editorial work into a repeatable, auditable pipeline that scales trilingual content velocity while preserving the "AI draft = pull request, human review required" trust principle essential to grant and partner credibility.

**Development Priority.** **MVP** — needed to sustainably operate the existing static site and enable Storytelling drafts once the AI Layer exists.

---

## 16. Dashboard

**Purpose.** The personalization home for all logged-in users across visitor/participant/Fellow segments, surfacing relevant dialogues, research, digest, events, impact evidence, and (for learners) Academy standing — always shown as capability gained, never a score.

**Primary Users.** Anonymous-to-identified visitors, participants, Fellows, and learners tracking Academy progress.

**Dependencies.** Core Platform, Community, AI Layer. *(Membership System connection is soft — the MVP dashboard shell does not require Membership to exist.)*

**Connected Modules.** Community, Fellowship System, Academy, Speech Academy, Writing Academy, Research Lab, Events, Publishing, Membership System, AI Layer.

**Required Database Entities.**
- Dashboard Module Manifest Entry — ordered, per-segment record of which modules appear and in what order
- User Preference — opt-in follow/topic settings driving personalization
- Impact Evidence Record — traceable participation evidence shown in the Impact Tracker (non-gamified)
- Academy Standing Record — a user's course/cohort completion state, surfaced as capability gained

**APIs.**
- Get Dashboard Manifest — returns the ordered module list for the requesting user's segment
- Get Personalized Digest — returns matched dialogues, research, and events for an opted-in user
- Get Impact Tracker Data — returns a user's traceable participation evidence
- Get Academy Standing — returns a user's Academy/Speech/Writing Academy completion status
- Update Follow Preferences — updates opt-in topic/follow settings

**AI Capabilities.**
- Matches research, dialogues, and events to opted-in interests for the Personalized Digest
- Recommends cold-start topic chips for newly identified users
- Surfaces Academy course recommendations aligned to Community Journey stage
- None for scoring or ranking users — Impact Tracker and Academy Standing are evidentiary, never gamified

**User Journeys.**
- A newly identified visitor picks cold-start topic chips and immediately sees a personalized digest.
- A participant checks the Impact Tracker to see concrete evidence of dialogues and events contributed to.
- A Fellow-track learner views Academy Standing to see which courses they've completed toward eligibility.

**Business Value.** Ties every other module's output into one coherent, non-gamified personal home, reinforcing the effect-not-attention success metric by showing real participation rather than engagement scores.

**Development Priority.** **MVP** — the shell (manifest, digest, impact tracker) is needed at initial launch for any logged-in experience; the Academy Standing sub-module is a V2 addition.

---

## 17. Admin Portal

**Purpose.** The internal staff-facing control surface consolidating moderation queues, Fellowship nomination review, translation-gap dashboards, editorial draft inboxes, event logistics management, and AI cost-governance telemetry — the back-stage workspace of the Service Blueprint.

**Primary Users.** Moderators, editorial staff, Fellowship committee reviewers, event logistics staff, engineers/ops.

**Dependencies.** Core Platform, AI Layer, Community, Fellowship System, Publishing, Events.

**Connected Modules.** Dashboard, Analytics, CRM, Knowledge Graph, Store.

**Required Database Entities.**
- *(No separate ModerationQueueItem — Admin Portal reads/acts on Publishing's `ModerationQueueEntry` directly. Corrected per Foundation Review.)*
- *(No separate FellowshipNomination — Admin Portal reads/acts on Fellowship System's `FellowNomination` directly. Corrected per Foundation Review.)*
- EditorialDraftInboxItem — AI- or contributor-drafted content awaiting sign-off
- EventLogisticsRecord — staff-facing operational detail for an event
- StaffRole — permission/role assignment scoping what a staff account can see or approve

**APIs.**
- Moderation Queue — list/act on flagged content
- Fellowship Nomination Review — list/approve/reject nominations
- Translation-Gap Dashboard — surfaces AI Layer's gap flags to editorial staff
- Editorial Draft Inbox — list/approve/reject AI or contributor drafts pending sign-off
- Event Logistics Management — staff view/update of event operational detail
- AI Cost-Governance Telemetry — staff view of AI Layer spend/usage

**AI Capabilities.** None performed directly — surfaces and lets staff act on AI Layer outputs, enforcing the human sign-off gate rather than generating content itself.

**User Journeys.**
- A moderator reviews a flagged community post and resolves it from a single queue.
- A Fellowship committee member reviews a nomination and records a decision.
- An editor opens the draft inbox, reviews an AI-drafted translation, and signs off before it publishes.

**Business Value.** Centralizes every "staff sees X" workflow into one operational surface, essential for a lean team to safely operate human-gated AI drafting and moderation at scale without proportional headcount growth.

**Development Priority.** **V2** for full consolidation, once Community, Fellowship System, and Publishing generate real staff-review volume — but a **minimal draft-inbox slice ships at MVP**, since the AI Layer's moderator-synthesis output needs a human sign-off surface from day one.

---

## 18. Analytics

**Purpose.** A cross-cutting internal module consolidating civic-effect measurement — participation-per-subscriber per language community, Impact Tracker source data, AI cost/usage telemetry, and Community ladder-stage movement — for internal decision-making only, never for engagement optimization.

**Primary Users.** CEO, CPO, CBO, and Admin/Ops staff preparing grant/funder reports.

**Dependencies.** Core Platform, Community, Membership System, Events, AI Layer. *(Fellowship System is NOT a hard MVP dependency — see reconciliation note; nomination-signal aggregation is a V2 addition.)*

**Connected Modules.** Dashboard, CRM, Store, Admin Portal, Fellowship System.

**Required Database Entities.**
- Metric Snapshot — a participation-per-subscriber datapoint per language community
- Funnel/Ladder Stage Event — a Community stage-transition record
- Fellowship Signal — an aggregated nomination signal *(V2 addition)*
- *(No independent AI Usage Record or Spend Ledger — Analytics reads and aggregates AI Layer's own Usage/cost ledger. Corrected per Foundation Review.)*
- Impact Tracker Source Record — traceable evidence underlying a reported outcome

**APIs.**
- Metrics Query — internal query over participation and funnel data
- Impact Tracker Feed — supplies traceable evidence to the Dashboard's Impact Tracker
- AI Spend/Ceiling Status — current spend vs. monthly cap, fallback state
- Funnel Stage Report — ladder-stage movement by cohort/language community
- Fellowship Signal Aggregation — combined nomination signal view *(V2)*
- Report Export — generates funder/grant reporting exports

**AI Capabilities.** None generative — consumes the AI Layer's per-request cost/model-tier telemetry to enforce the monthly spend ceiling and trigger automatic fallback to keyword search; explicitly excludes any attention/engagement-scoring logic.

**User Journeys.**
- The CPO reviews participation-per-subscriber by language community to prioritize outreach.
- The CBO checks AI cost telemetry against the monthly ceiling before approving a new AI feature.
- Fellowship reviewers view aggregated nomination signals in one place *(once V2 ships)*.

**Business Value.** Provides leadership a single authoritative, non-vanity measurement surface operationalizing "success is civic effect, not attention" — supporting funder reporting and nonprofit AI-budget discipline.

**Development Priority.** **MVP** for the core measurement surface (participation KPI, AI cost ceiling, Impact Tracker sourcing); Fellowship signal aggregation is a **V2** addition arriving alongside Fellowship System.

---

## 19. CRM

**Purpose.** Staff-facing relationship management for the organization's funding and institutional relationships — donors, members, institutional/government partners, grant funders — operationalizing conflict-of-interest firewalls and funding-source disclosure; distinct from the citizen-facing Community Engine.

**Primary Users.** Development/fundraising staff; finance staff; executive leadership and partnership managers.

**Dependencies.** Core Platform, Membership System.

**Connected Modules.** Community, Website & CMS, Analytics, Admin Portal, Research Lab, Store.

**Required Database Entities.**
- DonorRecord — individual/institutional donor relationship and giving history
- InstitutionalPartner — partner organization profile and partnership stage
- GrantFunder — grant-making body record with funding history and terms
- ConflictOfInterestDisclosure — logged disclosure and staff review outcome
- FundingSourcePublicationRecord — record of what's published to the public funding-disclosure page
- PartnershipStatusLog — history of partnership stage/status changes

**APIs.**
- Create/Update Relationship Record — adds or updates a donor/partner/funder entry
- Log Conflict-of-Interest Disclosure — records a disclosure and its review outcome
- Get Partnership Status — current stage of an institutional or funder relationship
- Publish Funding Disclosure — pushes approved funding-source data to the public disclosure page
- Generate Funder Report — compiles relationship/giving history for reporting

**AI Capabilities.** None — a staff administrative/governance tool; the "AI never originates institutional positions" principle applies with particular force given the conflict-of-interest and accountability stakes.

**User Journeys.**
- Development staff log a new institutional partnership and record its conflict-of-interest disclosure before any funds are accepted.
- Finance staff generate a funder report tracing a grant's restricted-vs-unrestricted use.
- An executive reviews partnership status across all government/institutional relationships to confirm editorial-independence compliance.

**Business Value.** Operationalizes the accountability and editorial-independence commitments required for institutional/government funding, and consolidates donor, member, and funder data in one governed system.

**Development Priority.** **MVP** — conflict-of-interest firewalls and funding-source disclosure are required for any institutional/government funding relationship, and the org already operates on active grant funding today.

---

## 20. Public API

**Purpose.** The external-facing API layer for institutional and academic partners — letting municipalities, universities, and researchers query the Knowledge Graph, embed grounded Q&A/dialogue tools, or integrate with the Event Platform under signed partner agreements.

**Primary Users.** Municipal government technologists; university researchers; institutional partner developers.

**Dependencies.** Core Platform, AI Layer, Knowledge Graph, Events.

**Connected Modules.** Knowledge Graph, AI Layer, Events, CRM, Admin Portal, Analytics.

**Required Database Entities.**
- Partner Account — an institutional partner's registered access
- API Key/Credential — issued credentials for partner authentication
- Partner Agreement — scope and terms governing partner access
- Usage Log — per-partner request and cost record
- Embed Configuration — settings for embedded Q&A/dialogue widgets
- Rate Limit Policy — throughput limits per partner tier

**APIs.**
- Knowledge Graph Query — read-only access for academic partners
- Grounded Q&A Embed — embeddable dialogue/Q&A widget for partner sites
- Event Data Integration — partner-scoped access to Event Platform data
- Partner Authentication/Key Issuance — credential provisioning
- Usage/Quota Status — partner-facing view of consumption against limits
- Partner Agreement Management — Admin Portal-facing tool to configure partner scope

**AI Capabilities.** Exposes the AI Layer's grounded retrieval and mandatory-citation Q&A for embedding on partner sites, under the same no-institutional-position rule; introduces no new AI models — purely external exposure of existing grounded retrieval.

**User Journeys.**
- A municipality embeds Res Publica's grounded dialogue Q&A widget on its own civic portal.
- A university researcher queries the read-only Content Graph API for academic analysis.
- A partner organization integrates event registration data under a signed agreement.

**Business Value.** Extends Res Publica's research and knowledge assets to institutional partners without diluting its trust-first brand, opening institutional-partnership revenue while keeping grounding/citation integrity intact through partner-agreement gating.

**Development Priority.** **V3** — the "Civic Infrastructure Platform" horizon named in the Future Roadmap, contingent on core participation, AI grounding, Events, and revenue modules validating first.

---

## 21. Dependency Map & Build Order

### Tier 0 — Core (build first)

| Module | Depends on |
|---|---|
| Core Platform | — |
| Website & CMS | Core Platform |

Nothing else can be trusted to build on the platform until this tier is hardened (engineering-audit fixes applied, caching in place, slug validation and rate limiting live per the security audit).

### Tier 1 — MVP (the "Grounded Civic Copilot" era)

Build roughly in this order — each module's listed dependencies are already satisfied by an earlier row in this table:

| Order | Module | Depends on |
|---|---|---|
| 1 | Knowledge Graph | Core Platform, Website & CMS |
| 2 | AI Layer | Core Platform, Website & CMS, Knowledge Graph |
| 3 | Publishing | Core Platform, Website & CMS, AI Layer |
| 4 | Community | Core Platform, Website & CMS |
| 5 | Membership System | Core Platform |
| 6 | Events | Core Platform, Website & CMS, AI Layer |
| 7 | Dashboard | Core Platform, Community, AI Layer |
| 8 | CRM | Core Platform, Membership System |
| 9 | Analytics (core scope) | Core Platform, Community, Membership System, Events, AI Layer |

Admin Portal's minimal draft-inbox slice also ships within this tier, riding along with Publishing and AI Layer, even though the module is fully realized at V2.

### Tier 2 — V2 (Structured Participation era)

| Order | Module | Depends on |
|---|---|---|
| 10 | Fellowship System | Community, Core Platform |
| 11 | Research Lab | Core Platform, Website & CMS, Fellowship System, Publishing |
| 12 | News Analysis Lab | Core Platform, AI Layer, Website & CMS, Publishing |
| 13 | Academy | Core Platform, Community, Fellowship System |
| 14 | Speech Academy | Core Platform, Community, Fellowship System, Academy |
| 15 | Writing Academy | Core Platform, Community, Fellowship System, Academy |
| 16 | Store | Core Platform, Membership System, Events, Academy, Publishing |
| 17 | Admin Portal (full consolidation) | Core Platform, AI Layer, Community, Fellowship System, Publishing, Events |
| — | Analytics (Fellowship-signal extension) | Analytics core, Fellowship System |

### Tier 3 — V3 (Civic Infrastructure Platform era)

| Module | Depends on |
|---|---|
| Public API | Core Platform, AI Layer, Knowledge Graph, Events |

### What can wait, and why

- **Public API is the only module that should wait until V3 under any circumstance.** It is external-facing, raises partner-agreement and rate-limiting complexity, and is only valuable once the Knowledge Graph and Events modules have enough real content and real participation history to be worth exposing externally. Building it earlier would mean exposing an immature, thin platform to institutional partners — a credibility risk, not a growth lever.
- **Store, Academy, Speech Academy, Writing Academy, Research Lab, News Analysis Lab, Fellowship System, and full Admin Portal are all correctly V2**, not because they're unimportant, but because each depends on Community and/or Publishing having real usage history before the thing they formalize (a top contributor tier, a trained-facilitator pipeline, a sellable catalog) has any real content to work with. Building Fellowship before Community has real participants, for instance, would mean nominating people against an empty ladder.
- **Everything in MVP is there because the roadmap's own MVP definition — the "Grounded Civic Copilot" — requires it as load-bearing infrastructure**: AI Layer and Knowledge Graph together *are* the copilot; Publishing is what lets it draft safely; Community and Events are the participation surfaces the copilot points people toward; CRM and core Analytics exist at MVP because the organization is already operating on real grant funding and real donor relationships today — those are not deferrable to "later," they're deferrable to "nowhere."

This is the complete, reconciled build order. Nothing above contradicts the Vision, Experience Blueprint, Operating System, or Implementation Plan already produced this session — it organizes them into one governed hierarchy.
