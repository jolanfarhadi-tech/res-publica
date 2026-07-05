# Res Publica — The Operating System

*Authored by the Chief Product Officer, Chief Design Officer, Chief AI Officer, Chief Architect, and Startup Founder of Res Publica. No code — this is the conceptual architecture of a world-class AI-first civic platform, built on top of the Vision, Experience Blueprint, and prior technical-architecture work already established this session. Every section follows the same structure: Goals, User Value, UX, Backend Architecture, AI Components, APIs, Database, Risks, Future Expansion.*

**Standing principles that govern every section below** (established earlier and never contradicted): AI may retrieve, translate, connect, and draft — it may never originate an institutional position or publish without a named human's sign-off. Nothing is gamified — no points, badges, streaks, or leaderboards, anywhere, because that reads as manipulative for a democracy-trust brand. Personalization is opt-in, GDPR-disciplined, EU-resident, and never required to use the site anonymously. The static Git/MDX core (Tier 1) stays untouched and fast; AI (Tier 2) and identity/personalization (Tier 3) are layered beside it, never inside its trust boundary.

---

## Table of Contents

1. Service Blueprint
2. Information Architecture
3. AI Architecture
4. Design System
5. Component Library
6. Storytelling System
7. Recommendation Engine
8. Personalization Engine
9. Community Engine
10. Fellowship Engine
11. Dashboard System
12. Search & Knowledge Graph
13. Event Platform
14. Mobile Experience
15. Future Roadmap (2026–2030)

---

## 1. Service Blueprint

**Goals.** Map every touchpoint a person has with Res Publica — digital or physical — against the back-stage labor that produces it, so no interaction is designed in isolation from its editorial, moderation, or translation cost. The blueprint makes invisible work visible internally: a published dialogue synthesis looks effortless to a citizen but represents hours of facilitation notes, moderation, translation, and human sign-off. A second goal is preserving the line between automated and human-judgment steps at every stage. A third is closing the loop between channels — an in-person workshop should feed a digital synthesis, and a digital dialogue should be able to convene a real-world forum — so the two are one continuous service, not parallel tracks.

**User Value.** A citizen gets a legible, low-friction front stage without needing to understand the machinery behind it. A researcher gets citable, source-grounded synthesis instead of raw transcripts. A policymaker gets a defensible account of "what was actually said" with provenance intact. A diaspora member gets language and calendar treatment that doesn't feel like an afterthought. Across all four, value comes from trust earned through consistent quality control, not trust assumed.

**UX.** Front-stage journeys vary by archetype but share a shape: discover (search, orientation engine, editorial content), engage (join a dialogue thread, register for a forum, submit a question), and receive (a synthesis, a digest, a follow-up invitation). In-person touchpoints are physically hosted but digitally bookended: pre-event framing and post-event synthesis both live in the same content system a purely digital visitor sees. Complexity is absorbed back-stage; the only front-stage signal of rigor is consistent provenance and clear human/AI attribution.

**Backend Architecture.** Back-stage systems connect the three tiers into a production pipeline: intake (raw dialogue/workshop notes, submitted questions, transcripts) feeds a moderation and editorial queue, which feeds synthesis drafting, translation, and publication back into the Tier 1 static MDX corpus and the Tier 2 vector store. Each stage is a discrete, auditable handoff with an owner and a status. Tier 3 identity data is kept structurally separate from the editorial pipeline so personalization never leaks into or contaminates the source-of-truth content. Physical-event logistics are a distinct operational track touching the content pipeline only at synthesis-intake.

**AI Components.** AI participates at two back-stage points and one front-stage point, never more: the Storytelling Engine drafts initial synthesis from raw material; a moderation-assist model flags (not removes) borderline content for human review; and the Tier 2 RAG layer answers grounded questions using published, human-approved content only. At no point does an AI system publish or represent an official position without a named human sign-off logged against it.

**APIs.**
- Intake API — accepts raw transcripts, workshop notes, and submitted questions
- Moderation Queue API — surfaces flagged submissions with AI-assist annotations
- Synthesis Draft API — serves AI-drafted synthesis and records edit/approval history
- Translation Handoff API — routes approved German source into EN/FA workflow
- Publication API — commits approved, translated content and triggers re-indexing
- Event Logistics API — manages registration, capacity, and facilitator materials

**Database.**
- DialogueRecord — a dialogue's full lifecycle, intake through published synthesis
- ModerationItem — a flagged submission with AI-assist metadata and disposition
- SynthesisDraft — versioned AI/human draft history
- TranslationTask — per-locale translation status and fallback flags
- EventRecord — logistics/attendance data, linked to a DialogueRecord
- ProvenanceLog — append-only record of who (human/AI) touched content, and when

**Risks.** Bottlenecking: if editorial/translation capacity can't keep pace, AI-assist steps quietly become the de facto authors, eroding the human-judgment boundary. Legitimacy drift if synthesis quality varies visibly between well- and thinly-staffed periods. Channel fragmentation, where in-person events fail to feed the digital pipeline, leaving a two-tier record. Moderation-assist tools risk false-negative complacency if reviewers over-trust AI flags.

**Future Expansion.** Federated intake for partner NGOs/municipalities/universities co-hosting dialogues, still passing through the same moderation/synthesis/translation spine. Standing regional chapters generating local dialogue records rolling up into national synthesis. A selectively public, anonymized provenance log as a transparency artifact, reinforcing the "effect, not attention" measure at an institutional level.

---

## 2. Information Architecture

**Goals.** One coherent taxonomy absorbing today's five collections (news, projects, research, publications, events) alongside new concepts — cornerstone/orientation pages, a glossary, user accounts, dialogues-as-structured-objects, dashboards — without two competing content models. Trilingual-aware by construction: every node has a defined fallback behavior when a German-authored page lacks an EN/FA counterpart. It must support anonymous visitors browsing a flat, discoverable sitemap and opted-in account holders navigating a personalized subset of the same graph, without forking the underlying model.

**User Value.** A coherent IA means a first-time visitor and a five-year participant experience the same site, not two products — the dashboard is a lens over the public graph, never a separate silo. The glossary lowers the barrier for civic-process vocabulary; cornerstone pages give confused first visitors a stable entry point. Trilingual users get predictable fallback behavior instead of broken links. Researchers benefit from dialogues modeled as structured objects with stable, citable identifiers.

**UX.** The sitemap organizes around four pillars — Orient (cornerstone pages, glossary, orientation engine), Explore (the five collections plus dialogues), Participate (join, register, ask), and Account (dashboard, digest preferences, impact tracker) — with cross-links generated from shared tags rather than manual curation. Every content type carries the same locale-fallback badge treatment. The glossary surfaces inline wherever a defined term appears, not just as a standalone page. Dialogues render with their own visual grammar (participants, timeline, synthesis, citations) rather than the article template.

**Backend Architecture.** The content model extends MDX-in-Git rather than replacing it: new types (glossary terms, dialogue records, cornerstone pages) follow the same Zod-validated pattern so the build-time pipeline doesn't fork. A content-relation layer expresses typed edges ("research informs dialogue," "dialogue produces publication") computed at build time from frontmatter references, not hand-maintained. Account and dashboard data live entirely in Tier 3 and never touch the Git-sourced content tree — the dashboard queries the content graph read-only.

**AI Components.** The Tier 2 vector store indexes the full taxonomy including glossary terms and dialogue synthesis, so RAG answers cite across content types. An AI-assisted tagging pass proposes cross-collection relations during editorial review, but every relation is human-confirmed before it renders publicly. The orientation engine sequences existing nodes based on the same taxonomy rather than generating new ones.

**APIs.**
- Content Graph API — resolves typed relations between any two content nodes
- Taxonomy API — serves the canonical tag/category tree
- Glossary API — resolves term lookups and inline annotations per locale
- Locale Fallback API — determines which language variant is being served
- Dialogue Object API — serves structured dialogue records as a distinct type
- Dashboard Aggregation API — assembles a personalized view read-only from the public graph

**Database.**
- ContentNode — canonical reference to a Git-sourced MDX item, keyed across locales
- ContentRelation — typed, human-confirmed edge between two ContentNodes
- GlossaryTerm — definition, locale variants, inline-annotation triggers
- DialogueRecord — the structured dialogue object, exposed here as an IA node type
- User / ConsentRecord — Tier 3 account and opt-in state, structurally isolated
- DashboardView — cached, per-user aggregation of graph nodes plus preferences

**Risks.** Taxonomy sprawl — AI-assisted tagging plus organic growth could produce near-duplicate tags that make filtering useless. Fallback confusion if locale-fallback labeling isn't visually unmistakable. Orphaned content — dialogue records never connected into the graph become invisible. Conflating the public content graph with personalized dashboard state would violate the anonymous-use-always-preserved principle.

**Future Expansion.** Extending to languages beyond FA/EN without restructuring, since fallback logic is already locale-parametric. External references (partner-organization publications, government documents) as a lighter-validated node type. A public, read-only Content Graph API for academic partners. The glossary growing into a licensable civic-education product.

---

## 3. AI Architecture

**Goals.** One coherent AI layer governing every AI-touching capability — grounded retrieval, translation-gap detection, moderator synthesis, and future reasoning — under shared principles: answers must trace to Tier 1 content, AI assists judgment but never originates a position, German remains source-of-truth for cross-checks, and every capability operates inside fixed cost ceilings appropriate to nonprofit funding.

**User Value.** Visitors get plain-language, cited answers instead of raw search results. Editors get early warning when EN/FA content drifts out of sync with German, instead of discovering gaps by accident. Moderators facilitating dialogue events get a real-time synthesis aid without it replacing their judgment — all without new hallucination risk, since every output traces to a specific committed document.

**UX.** A copilot widget answers questions with inline citations and a visible "grounded in these documents" disclosure; when no source supports an answer, it visibly declines rather than guessing. Editors see a translation-gap dashboard surfaced during normal review, not as a blocking gate. Moderators access an optional live-session panel showing emerging themes, dismissible and never auto-published.

**Backend Architecture.** Sits entirely within Tier 2 and above; Tier 1 static rendering is untouched. A shared embedding/index pipeline rebuilds deterministically from Git-committed MDX on each merge. The RAG query service enforces citation-or-refuse behavior for all consumer features. A translation-gap service diffs frontmatter and content structure across locale siblings on each commit. A moderator-synthesis service ingests structured session notes (new, opt-in, not MDX) and produces ephemeral, non-persisted summaries. All services share one prompt/guardrail library and one cost-governance layer.

**AI Components.** A single multilingual embedding model spans DE/EN/FA in one semantic space. A tiered LLM strategy starts with a small/cheap model, escalating only when confidence is low. A citation-enforcement layer rejects any answer that cannot map to a retrieved passage. A translation-drift classifier combines rule-based diffing with semantic-similarity checks. A dialogue-synthesis summarizer produces theme clusters, not attributed institutional claims.

**APIs.**
- POST /copilot/query — grounded question-answering with citations or refusal
- GET /translation-gaps — report of missing/stale EN/FA content relative to DE
- POST /moderator/synthesize — ephemeral theme summary for a live session
- POST /feedback — structured feedback on an AI answer's usefulness/accuracy
- GET /ai/usage — internal cost/usage telemetry against spend ceilings

**Database.**
- Vector store — embeddings + metadata keyed to source MDX path and commit SHA
- Translation-gap ledger — locale pairs, gap type, detected date, resolution status
- Prompt/response audit log — query, retrieved sources, model tier, output
- Feedback log — per-answer ratings/comments, linked to audit log entry
- Usage/cost ledger — per-request token cost, model tier, running spend

**Risks.** Hallucination despite grounding if retrieval returns weakly relevant passages. Institutional-voice drift if phrasing reads as opinion rather than citation. Cost overrun from escalation-tier overuse. Farsi quality lagging DE/EN as a lower-resource language. Latency/infrastructure coupling eroding Tier 1 isolation over time.

**Future Expansion.** Cross-tier reasoning agents combining RAG, graph traversal, and storytelling discovery. Optional integration with Tier 3 personalization once opt-in, EU-resident infrastructure exists. Expanded moderator tooling. Periodic model/cost audits shifting the escalation threshold as small-model capability improves.

---

## 4. Design System

**Goals.** Extend the existing token set (ink/bg/surface/accent/accent-contrast/gold/muted/border) and component vocabulary into a complete system capable of specifying every Operating System surface without a second visual language for "the new stuff." Formalize what's currently implicit — a typography and spacing scale, motion principles, explicit RTL-mirroring rules. Solve, once, how to visually distinguish AI-surfaced content from human-authored content so it reads as transparent rigor, not a warning label.

**User Value.** Visual consistency is itself a trust signal for an organization whose value proposition rests on being trustworthy. Farsi-reading users get a genuinely mirrored, not merely flipped, experience. A calm, low-noise interface — motion and density restrained enough that a dashboard doesn't feel like a growth-hacked consumer app. A legible, non-alarming way to know when reading an AI-assisted synthesis versus a human-authored article.

**UX.** The typography scale extends Fraunces (headings) and Vazirmatn (Farsi body) across five or six steps, shared across languages so hierarchy feels equivalent despite differing glyph proportions. A single base-unit spacing scale applies identically to cards, dashboard tiles, and dialogue timelines. Motion is restrained and purposeful — brief, low-amplitude transitions, never celebratory. RTL mirroring flips layout direction and directional iconography while deliberately not mirroring elements with fixed real-world meaning. AI-attributed content gets a consistent, quiet visual marker — a labeled border and inline citation chips — applied identically wherever it appears.

**Backend Architecture.** Design tokens remain the single source of truth, consumed by both the Tier 1 static build and any dynamic Tier 3 surfaces, so personalization never forks the visual language. A token pipeline compiles shared primitives into consumable outputs for the existing component vocabulary and new Operating System components (DialogueObject, GlossaryAnnotation, DashboardTile, OrientationStep, AIAttributionBadge). Theming stays locale-aware at the token level (logical, not physical, spacing properties) so RTL support is structural.

**AI Components.** One canonical AI-involvement treatment used everywhere: a quiet border/background differentiation, a small persistent label ("AI-assisted draft" / "AI-grounded answer"), and inline citation chips. This covers the RAG answer surface, Storytelling Engine drafts, and editorial AI-tagging suggestions. Motion for AI-generated loading states is understated — a soft fade, never a flashy generative-shimmer effect.

**APIs.**
- Design Token Export — publishes the canonical token set for build-time consumption
- Component Registry — catalogs components with props, states, and locale variants
- Icon/Asset Registry — manages directional iconography with RTL-mirroring metadata
- Motion Spec Service — defines named transition/duration tokens
- AI Attribution Schema — standardizes the label/border/citation-chip pattern

**Database.**
- UserThemePreference — opt-in Tier 3 record of accessibility/display preferences
- ComponentUsageLog (internal) — tracks active component/token usage for design audits

**Risks.** RTL mirroring bugs shipping unnoticed since FA is the lowest-traffic locale. The AI-attribution treatment drifting as new features ship faster than design governance. Motion and density creeping upward under future feature pressure. A token system not genuinely shared between Tier 1 and Tier 3 risks silently forking into two visual languages.

**Future Expansion.** A dark-mode refinement pass informed by real Tier 3 usage data. Native-app tokens if Res Publica extends beyond the web. Reuse of the AI Attribution Schema enforced across any future AI feature via Component Registry review. A documented "restraint budget" any new feature proposal is evaluated against.

---

## 5. Component Library

**Goals.** Extend the existing vocabulary (Header, Footer, EntryCard, CollectionIndex/Detail, TagFilter, SearchClient, NewsletterSignup, PageHeader, Container) into a single, coherent set that can build every Operating System surface without spawning a parallel design system. New features are assembled from existing primitives the large majority of the time; genuinely new primitives are added deliberately and documented alongside the originals.

**User Value.** One visual and interaction grammar everywhere, so trust built on the homepage transfers to the dashboard, a dialogue signup, or an AI-assisted summary. Reduced cognitive load in high-stakes moments — orientation, giving feedback, reading a synthesized answer. Farsi/RTL users get first-class components, not a mirrored afterthought; low-vision and keyboard users get the same guarantees on every new surface.

**UX.** Six component categories extend the current set: Status & Feedback (StatusPill — never red; InlineNote; EmptyState); Module Shell (the dashboard card wrapper); Orientation (StepPrompt, ChoiceChip, ProgressRail — non-gamified); Participation (DialogueCard, RSVPControl, ContributionReceipt, ImpactStatement); Narrative/MDX (Callout, PullQuote, SourceCitation, Timeline, FigureWithCaption); AI-Answer (AnswerBlock, CitationChip, ConfidenceNote, SourceList). Every component declares the same state matrix (default, loading, empty, error, RTL-mirrored, reduced-motion) and consumes tokens rather than raw values.

**Backend Architecture.** Components stay presentation-only: no direct data fetching, only typed props from server components or loaders. A shared "content contract" layer sits between components and data sources, so a backend/CMS migration never requires touching component internals.

**AI Components.** AnswerBlock, CitationChip, ConfidenceNote, and SourceList make AI-assisted content visually distinct from human-authored text — different border/shape treatment, mandatory citation affordance, explicit confidence-framing so a synthesized answer can't present false certainty. Shared across dashboard digests, semantic search, and future research tooling.

**APIs.**
- Theme/Token Provider — resolves tokens per theme and locale
- i18n String Provider — resolves component-level copy for de/en/fa with RTL flags
- MDX Component Registry — maps MDX node types to Narrative primitives
- Icon Set Contract — versioned icon inventory with RTL-mirror flags
- Component Analytics Emitter — fires render/interact events tagged by component/variant
- Calendar Adapter — supplies Gregorian/Solar Hijri formatting to any date component

**Database.**
- Component Usage Registry — logs which components/variants render where, for QA
- Token/Theme Version Table — records token-set versions for rollback/regression comparison
- Copy Deck Table — per-component, per-locale string entries

**Risks.** Team pressure to ship quickly producing bespoke one-off components that fork the system, multiplying RTL/accessibility testing surface. AI-Answer primitives reused carelessly on non-AI content, blurring the distinction they exist to preserve. Token drift (a hardcoded color) as the most likely accessibility regression vector.

**Future Expansion.** A themable variant layer for local chapters or partner co-branding without forking tokens. Open-sourcing the component library as a civic-tech commons contribution. Component-level analytics feeding a quarterly design-debt review. A living component catalogue as the canonical reference.

---

## 6. Storytelling System

**Goals.** A content-intelligence system that discovers narrative connections across the org's siloed content — a dialogue outcome, a research finding, a policy position — and drafts explainer narratives in all three languages via genuine per-language re-narration, not mechanical translation. Every draft is a pull request: AI proposes, a named human editor disposes. Drafts and published pages must stay fully structured and crawlable, avoiding the generic, uncited "AI slop" pattern.

**User Value.** Readers encounter contextualized stories connecting previously disconnected content. Editors receive a fully sourced narrative starting point with citations pre-verified, saving drafting time while retaining full control over voice and whether to publish at all. The organization's SEO and third-party citability improve because every AI-assisted page stays structured and sourced.

**UX.** An editorial "draft inbox" lists AI-suggested story connections as PR-style cards: source documents, confidence score, draft title/summary per language. Editors approve as-is, edit inline, request regeneration, or reject with a reason — every action logged and recorded in commit metadata alongside an "AI-assisted" flag. Readers never see any AI-origin indication beyond the org's standard sourcing footer.

**Backend Architecture.** A content-graph traversal service scores candidate connections by entity overlap, topical similarity, and temporal proximity. A per-locale draft-generation service runs three independent re-narration passes, each calibrated to that language's register and audience. Drafts route through a Git-integrated editorial queue (one branch/PR per draft), reusing existing Git workflow rather than a separate CMS. A structured-data generator attaches schema.org/JSON-LD and citations before review.

**AI Components.** A connection-discovery model ranks candidate story links by combined semantic, entity, and recency signals. Three per-locale drafting passes use prompts calibrated to each language's register (formal Farsi, plain-language German). A citation-verifier blocks any unverifiable claim before a draft reaches an editor. An SEO/structured-data assistant produces metadata consistent with the final approved text.

**APIs.**
- POST /storytelling/discover — generate candidate cross-content story connections
- GET /storytelling/drafts — list pending AI-drafted narratives awaiting review
- POST /storytelling/drafts/{id}/approve — human sign-off; merges and publishes
- POST /storytelling/drafts/{id}/reject — discard with a recorded reason
- POST /storytelling/drafts/{id}/regenerate — request a new draft variant
- GET /storytelling/citations/{id} — full source/citation audit trail

**Database.**
- Candidate-connection ledger — scored content links, discovery date, staleness flag
- Draft store — per-language draft text, citations, model/version, generation cost
- Editorial decision log — approver identity, timestamp, edits, rejection reasons
- Structured-data cache — schema.org output linked to the published commit SHA

**Risks.** Drafts reading as generic or repetitive if connection scoring is too permissive. False correlations connecting unrelated content. Editorial bottlenecks if draft volume outpaces reviewer capacity. Per-locale re-narration drifting from source meaning, particularly for Farsi's distinct register. SEO harm if structured data is generated before final edits.

**Future Expansion.** Campaign/anniversary-triggered storytelling prompts. Reader feedback signals feeding which connections get prioritized. An evolving editorial style-memory matching the organization's voice over time. Syndication of approved narratives to partner NGOs.

---

## 7. Recommendation Engine

**Goals.** Surface "matched research," "related dialogues," and cross-collection connections for both anonymous sessions and identified users — optimizing for relevance-to-civic-agency, not click-through. Works usefully with zero account, improves (opt-in) with history. Every recommendation stays legible, never a black box.

**User Value.** A citizen mid-research finds the dialogue or paper that helps, without creating an account or knowing what to search for. Anonymous visitors get full value from content-based matching alone. Farsi/diaspora readers get relevant German-origin material bridged to them rather than staying invisible.

**UX.** Inline "Related dialogues" and "Matched research" cards; a persistent "Because you read X" caption on every recommendation; no autoplay, no infinite scroll, no algorithmic homepage feed. Recommendations are dismissible and adjustable ("show me less like this").

**Backend Architecture.** A content-based similarity engine runs over the static corpus, with embeddings and topic/entity tags computed in batch at publish time — not from live behavioral tracking. Anonymous sessions get a short-lived, session trail as the only signal. An opt-in account-based layer (Tier 3) blends longitudinal history into ranking but never replaces the content-based baseline.

**AI Components.** Multilingual embedding model for semantic similarity; a lightweight co-occurrence/graph model for "related dialogues"; an explanation generator deriving the "shown because" rationale from the same features driving the ranking. Explicitly no collaborative filtering on raw behavioral logs, no engagement-optimized reranking.

**APIs.**
- GET /recommendations/content/{id} — related items for a content page, anonymous-safe
- GET /recommendations/session — suggestions from the current anonymous session
- GET /recommendations/personal — account-history-informed matches (opt-in)
- GET /recommendations/{id}/explain — legibility rationale for a specific recommendation
- POST /recommendations/feedback — mark a recommendation not relevant

**Database.**
- content_embeddings — versioned vector representation per content item
- content_tags — multilingual topic/entity/region tags
- content_relations — precomputed cross-references
- session_context (ephemeral) — anonymous session's recent interactions
- recommendation_feedback — opt-in hide/not-relevant signals

**Risks.** Drift toward implicit engagement optimization if success is measured by click-through. Embedding corpus skew underrepresenting Farsi content. Over-personalization eroding legibility as the account-based layer grows.

**Future Expansion.** Cross-language bridging recommendations with translation status shown. Outcome-weighted ranking favoring content preceding real participation over content merely clicked. Periodic civic-effect audit of recommendation quality.

---

## 8. Personalization Engine

**Goals.** Adapt what a signed-in or lightly-profiled user sees — topic/language preferences, saved items, participation history, notification cadence — under strict data minimization, full opt-in consent, and a progressive account model that never forces identity disclosure to get value.

**User Value.** Citizens control their own experience without handing over more data than necessary. A "light" local profile allows trying personalization with zero account friction; a full account unlocks saved items, history, and digests only when chosen. Anonymous site use remains completely unaffected.

**UX.** The Dashboard is the personalization home. A visible preference center lets users adjust topics, language, and cadence at any time. Every personalized surface is toggle-able and explainable. Account creation is deferred until value is already demonstrated — never gated upfront, never nudged via dark patterns.

**Backend Architecture.** Three progressive tiers: fully anonymous (nothing persisted); a light local profile (pseudonymous, explicit preferences only, no server-side identity link); a full account within Tier 3 (EU-hosted, GDPR-compliant, saved items, history, consent records). Promotion between tiers requires explicit action and re-confirmed consent — nothing auto-upgrades.

**AI Components.** A preference-inference assistant proposes topics from explicit signals but only as suggestions requiring confirmation. A digest composer ranks content against confirmed interests and chosen cadence. A language-gap detector flags when a Farsi-preferring user's relevant content exists only in German, prioritizing it in the translation queue.

**APIs.**
- GET/PUT /profile/preferences — topic/language/cadence settings
- POST /profile/upgrade — migrate a light local profile into a full account
- GET/POST /profile/saved-items — view/save/unsave content
- GET /profile/participation-history — opt-in record of attendance
- GET/PUT /profile/consent — view and modify all consent grants
- GET /digest/preview — preview the next personalized digest before it sends
- DELETE /profile — full account and data deletion (GDPR erasure)

**Database.**
- local_profiles — pseudonymous preferences, no PII
- accounts — full identity records, EU-resident, encrypted at rest
- consent_records — granular, timestamped, revocable opt-in log
- saved_items — user-to-content bookmarks
- participation_history — opt-in attendance record
- notification_preferences — digest cadence and channel settings
- data_retention_log — audit trail for erasure/export requests

**Risks.** Local-to-account migration carrying over more data than consented. Preference drift creating filter bubbles even absent engagement-optimization intent. Digest defaults nudging toward more contact than intended. Consent-UI complexity causing consent fatigue.

**Future Expansion.** Cross-device local profile sync without a full account. Shared preference profiles for civic organizations/families. Consent-scoped, machine-readable data export for the citizen's own portability.

---

## 9. Community Engine

**Goals.** Track, with explicit consent, where a person sits on the Community Journey ladder; trigger the next appropriate invitation at the right moment; support three distinct per-language evangelism mechanics; connect digital engagement to real-world touchpoints — without ever reading as a CRM funnel.

**User Value.** People receive the next genuinely meaningful invitation rather than generic marketing. Diaspora Farsi speakers get dignity-preserving, private invitations instead of public broadcast pressure; the German audience gets institutionally-credible next steps; the English audience gets exportable-methodology framing.

**UX.** Invitations surface contextually — at the end of a dialogue recap, in a digest footer — never as popups. Framing matches the mechanic: German invitations co-signed by an institutional partner; English invitations link to a "bring this methodology" toolkit; Farsi invitations offer a private, encrypted share link with no public social pressure. Ladder position is never shown as a progress bar.

**Backend Architecture.** A rules/state engine (deliberately not ML-scored) maps consented signals — content read, dialogue RSVP'd, forum attended, referral shared — to stages in the Community Journey model. An invitation-trigger service selects the next-best invitation from a curated, human-authored library based on stage, language, and recent activity — not generative. A real-world touchpoint bridge integrates with dialogue/forum registration so attendance itself confirms progression.

**AI Components.** A light classification model assists staff in tagging invitation content to ladder stage and language mechanic (human-in-the-loop, not autonomous sending). An anomaly detector flags invitation fatigue and suppresses sends. A translation-quality assistant reviews Farsi invitations for dignified, personal tone before any diaspora-facing send — always with human sign-off.

**APIs.**
- GET /community/ladder-stage — current opt-in stage for the authenticated user
- POST /community/events/{type} — record a consented milestone
- GET /community/next-invitation — next-best invitation for the user's stage/language
- POST /community/invitation/{id}/respond — accept, decline, or snooze
- GET /community/real-world-touchpoints — upcoming dialogues/forums matched to stage
- POST /community/referral — generate a personal/encrypted share link

**Database.**
- ladder_stages — stage definitions and allowed transitions
- ladder_progress — per-user (opt-in) current stage and transition history
- milestone_events — consented log of real-world and digital actions
- invitation_library — human-authored content tagged by stage/language/mechanic
- invitation_sends — record of sends, responses, and suppression state
- referral_links — privacy-scoped share-link records for the diaspora mechanic

**Risks.** Mechanical or over-frequent transitions making the ladder feel like a funnel. Over-tuned invitation timing eroding trust. The Farsi referral links must be genuinely private and encrypted, not just labeled as such, given the safety stakes for diaspora civic activity. The curated content library going stale without ongoing upkeep.

**Future Expansion.** Cohort-level, anonymized ladder analytics for organizational strategy without individual tracking. Co-invitation mechanics extended to partner organizations. Offline/low-bandwidth invitation delivery for diaspora users with limited connectivity.

---

## 10. Fellowship Engine

**Goals.** A deliberate, human-gated system for recognizing and inviting the platform's deepest-tier contributors — dialogue facilitators, research reviewers, per-language community leads — as the top rung of the Community Journey ladder. Fellowship formalizes a relationship the organization already wants without turning it into a leaderboard: rare, human-adjudicated, and revocable.

**User Value.** Emerging contributors get a legible, dignified path from "I keep showing up" to "I have a recognized role with real responsibility" — mentorship, named credit, a direct line to staff, influence over process, rather than points. The organization converts high-trust volunteers into a stable bench of facilitators and reviewers, sourced from people who've already demonstrated judgment.

**UX.** No public leaderboard, badge, or score exists anywhere. A Fellow's presence surfaces only in dignified, functional ways: a named byline or "reviewed by" credit, an internal facilitator roster for scheduling, and a private "Fellowship" tab in their own dashboard listing current responsibilities and commitments in plain language. Invitations happen through a human conversation initiated by staff — never an automated congratulations screen.

**Backend Architecture.** A nomination pipeline aggregates qualitative and light quantitative signals from the Impact Tracker into a staff-only review queue — never an auto-threshold that grants status. Staff review nominees manually, considering signals the system can't capture. On approval, a Fellowship record links the person to specific role(s) and language/topic scope, with start date, sponsoring staff member, and renewal cadence.

**AI Components.** An internal-only "signal digest" assistant summarizes a candidate's platform history into a short qualitative brief for the human reviewer — a decision-support aid, never a decision-maker, never scored numerically. Every claim in the digest links to the underlying record, keeping the recommendation auditable and contestable by staff.

**APIs.**
- Nomination Signal Feed — aggregates Impact Tracker events into staff review queue entries
- Fellowship Record API — create/update/end a Fellow's role, scope, and sponsor
- Role Scope Registry — defines available role types and their permissions
- Credit/Byline API — attaches Fellow attribution to content
- Renewal Reminder Service — notifies staff sponsors ahead of a Fellowship's review date

**Database.**
- Fellowship Record — person, role(s), scope, sponsor, start/renewal dates, status
- Nomination Queue — candidate, aggregated signals, reviewing staff, decision, rationale
- Role Scope Table — canonical list of role types and responsibilities/permissions
- Attribution Log — links Fellow credit to specific published content

**Risks.** Any quantification of the nomination signal risks being reverse-engineered into a de facto leaderboard; signals must stay descriptive, never shown to the candidate pre-decision. Understaffing the human review step turns the queue into a bottleneck or pressures auto-approval. Fellowship must have a clear, respectful offboarding path to avoid the relationship curdling into status anxiety.

**Future Expansion.** A "Fellows' council" convening periodically to feed contributor perspective into governance decisions. Regional/language-specific Fellowship cohorts as the org expands beyond German-speaking regions. A sponsor-rotation model so no single staff member becomes an unaccountable gatekeeper.

---

## 11. Dashboard System

**Goals.** Generalize the Dashboard Concept into a configurable module system serving three segments — anonymous/visitor, identified participant, and Fellow — from one codebase and one data model, in all three locales with full RTL correctness, remaining visually and tonally inseparable from the rest of the static site.

**User Value.** Each segment sees a dashboard suited to them instead of an empty shell or an over-built interface, without the product maintaining three separate pages. Users in every language get equal fidelity, including correct Solar Hijri dates and full mirroring for Farsi.

**UX.** Dashboards are composed from an ordered list of Module Shell instances selected by segment: visitor sees a cold-start topic picker, sample digest preview, and orientation prompt; participant sees the full concept (Active Dialogues, Matched Research, Personalized Digest, Upcoming Events, Impact Tracker, Follow/Preferences); Fellow adds a Fellowship Responsibilities module. Module order is fixed per segment (not user-draggable) to preserve the single linear reading order accessibility requires.

**Backend Architecture.** A Dashboard Configuration Service resolves, for a given user, their segment and locale, returning an ordered module manifest with each module's data-fetch requirement declared separately — rendering and data fetching stay decoupled. Segment is derived from existing account/participation state (no separate field to hand-maintain), so promotion from visitor to participant to Fellow updates the dashboard automatically as underlying facts change.

**AI Components.** The Personalized Digest and Matched Research modules reuse AI-Answer primitives to summarize and rank content; every summarized item shows its source and, where AI-assisted, a citation/confidence marker. No AI component determines a user's segment or Fellowship eligibility — that remains a separate, human-gated pipeline.

**APIs.**
- Dashboard Configuration Service — resolves segment + locale into an ordered module manifest
- Module Data Gateway — per-module data-fetch endpoints
- Preferences/Follow API — read/write followed topics, cadence, chip selections
- Segment Resolver — derives visitor/participant/Fellow status from underlying facts
- Digest Compilation Service — assembles and ranks the Personalized Digest

**Database.**
- User Preference Record — followed topics, cadence, locale, chip selections
- Module Manifest Table — per-segment default module order and configuration
- Impact Event Log — traceable participation records feeding the Impact Tracker
- Digest Snapshot — generated digest instances per user per cadence cycle

**Risks.** Segment-based composition quietly becoming segment-based gatekeeping if teams hide content rather than reorder it. A shared manifest system becoming a dumping ground for every new feature's module slot. RTL/calendar correctness needing re-verification per new module, not assumed inheritance.

**Future Expansion.** User-visible customization of module order within accessibility constraints. Chapter- or region-specific modules for local events. A "dashboard for organizations" variant for partner NGOs. Deeper integration between the Impact Tracker and Fellowship nomination signals.

---

## 12. Search & Knowledge Graph

**Goals.** Replace today's flat, per-locale keyword JSON index with a true knowledge graph of entities — people, organizations, topics, legislation, dialogues, findings — and their relationships, derived deterministically from the same Git-committed MDX driving Tier 1. The graph powers both semantic RAG retrieval and cross-collection recommendations, rebuilding automatically with zero separate manual curation burden.

**User Value.** Visitors get materially better search relevance and cross-collection "related content." Researchers and journalists can trace how a topic threads through the organization's work over time. Editors get this entirely for free — no new tagging workflow — since the graph is extracted from content that already exists.

**UX.** Search results and content pages gain a "related" panel informed by graph proximity, not just keyword match. Staff get an optional graph-explorer view. The public-facing surface stays deliberately understated — better-ranked, better-connected content, not a literal graph visualization — consistent with the site's static-first ethos.

**Backend Architecture.** An extraction pipeline runs at build/index time over MDX content and frontmatter, identifying entities via NER plus explicit frontmatter references, and inferring relationships via co-occurrence, explicit cross-links, and topical/temporal proximity. The graph store is versioned and rebuilt from the same Git commit that produces the Tier 2 vector index. Hybrid retrieval combines vector similarity with graph traversal, isolated from Tier 1 build/render paths.

**AI Components.** A multilingual NER/entity-linking model canonicalizes entities across DE/EN/FA mentions of the same person, organization, or topic. A relationship-extraction model infers typed edges ("dialogue informed policy," "finding cited in publication"). An entity-resolution step merges cross-locale name variants into one canonical node.

**APIs.**
- GET /graph/entity/{id} — entity profile with linked content and relationships
- GET /graph/related/{contentId} — related entities/content for a given page
- POST /graph/query — internal graph traversal
- GET /search — hybrid keyword + semantic + graph-informed search
- GET /graph/rebuild-status — internal status of the latest graph build/sync

**Database.**
- Entity table — canonical ID, type, per-locale labels and aliases
- Relationship/edge table — source, target, edge type, weight, supporting citation
- Entity-to-content mapping — links entities to MDX paths at a specific commit SHA
- Build/version ledger — which Git commit produced the current graph snapshot

**Risks.** Entity-resolution errors merging distinct people/organizations, or failing to match German/Farsi name variants. Relationship extraction overstating causation between loosely connected items. Graph staleness if the rebuild pipeline lags Git commits. Added build-time complexity risking Tier 1 rendering speed unless isolation is strictly maintained.

**Future Expansion.** A public graph-explorer aligned with the transparency mission. Open-data export of the knowledge graph for external research reuse. Linking to external legislation/parliamentary databases as first-class entities. Graph-informed recommendations feeding an opted-in Tier 3 personalization layer.

---

## 13. Event Platform

**Goals.** Convert today's static, MDX-only event pages into a complete lifecycle: discovery, registration, pre-event logistics support, capacity/waitlist management, and post-event outcome publishing. Close the loop in the Community Journey — a citizen who registers for a forum should later see what came of it without hunting.

**User Value.** A participant gets a frictionless way to reserve a spot, ask logistics questions and get accurate, grounded answers instantly rather than emailing organizers. If full, they're waitlisted transparently and notified if a spot opens. Afterward, they receive a concrete outcome summary — turning one-off attendance into visible civic effect.

**UX.** Event pages gain a registration CTA with a lightweight form (name, email, language preference, accessibility needs) and immediate confirmation. An embedded chat widget answers logistics questions grounded strictly in that event's own content. If full, the CTA becomes "Join Waitlist" with a visible position indicator. After the event, the page updates in place with an "Outcome" section, and registered participants get a notification linking directly there.

**Backend Architecture.** The first Res Publica feature requiring genuinely stateful data. Sits atop the AI Retrieval Layer for event-scoped Q&A and depends on the Personalization & Identity Layer — registration requires lightweight identity and persistence, making full lifecycle support a V2/V3-era capability. A small transactional store tracks registrations and capacity; outcome publishing remains editorially controlled and republishes into the static content pipeline post-event.

**AI Components.** An event-scoped grounded Q&A assistant, architecturally identical to the MVP Copilot but retrieval-restricted to a single event's fields — preventing cross-event hallucination. A second, lower-stakes component drafts outcome summaries from organizer notes for human review before publishing.

**APIs.**
- Event Registration API — create/cancel a registration
- Capacity & Waitlist API — tracks fill state, promotes waitlisted entries
- Event Logistics Q&A API — grounded chat scoped to one event
- Outcome Publishing API — attaches/updates published outcome content
- Participant Notification API — confirmation, waitlist promotion, outcome-ready alerts
- Registration-Outcome Linking API — resolves a participant's history to outcomes

**Database.**
- Events — structured fields (capacity, location, accessibility notes) beyond MDX body
- Registrations — participant, event, status (confirmed/waitlisted/cancelled)
- Waitlist Entries — ordered queue with promotion timestamps
- Event Outcomes — published summary content, linked to source event
- Notification Log — sent/delivered state for auditability
- Participant Record — minimal identity (email, language pref, accessibility flags)

**Risks.** Collecting participant PII is a first for the organization, triggering real GDPR obligations that must be taken seriously from day one. Logistics Q&A hallucinating a wrong address or time is reputationally costly — grounding must be strict, deferring to "contact organizer" rather than guessing. Waitlist automation risks unfairness for accessibility-priority attendees unless manual override remains available. Scope-creep risk into a full event-management CRM if not deliberately bounded.

**Future Expansion.** Calendar sync (ICS export, reminders), cross-event participant history feeding V2's personalized civic pathways, and co-hosted event support for municipal/university partners running their own dialogue sessions, with outcome data feeding longitudinal civic-effect measurement.

---

## 14. Mobile Experience

**Goals.** Ensure the platform is genuinely usable on the devices and connections its most civic-critical audience actually has — older Android phones, limited data plans, Farsi-speaking users less served by mainstream app ecosystems — without committing a small team to the ongoing tax of native iOS/Android development. Make the deliberate case that a native app is the wrong first investment.

**User Value.** Instant access with no app-store friction, no forced update cycles, small download footprint. Saved/cached content remains available with poor or no connectivity. Push-style reminders for registered events work without requiring an app install.

**UX.** The existing responsive design becomes installable as a Progressive Web App (add-to-home-screen, app-like chrome, offline splash state). A service worker caches the static core so degraded connectivity degrades gracefully. Notification permission is requested contextually (at event registration), never as a global pop-up. RTL/Farsi layouts get dedicated mobile QA passes, since RTL bugs surface disproportionately on small screens.

**Backend Architecture.** No new heavy infrastructure: a service worker plus cache manifest sits in front of existing static hosting. Push notifications use the standard Web Push API with a minimal subscription-token store, feeding into the Event Platform's Participant Notification API. AI Copilot calls remain server-side, but the mobile chat UI is designed for streaming, small-payload responses.

**AI Components.** No mobile-specific AI model — reuses the same server-side grounded retrieval Copilot, with UI-level adaptations (shorter default answers, progressive loading) for bandwidth. One targeted use: auto-generating concise, multilingual push-notification copy for event reminders, since hand-writing three-language variants doesn't scale with a small team.

**APIs.**
- Push Subscription API — register/unregister a device for web push
- Notification Preference API — per-participant opt-in granularity
- Offline Content Manifest — defines what the service worker pre-caches
- Locale/Direction Detection API — serves correct LTR/RTL layout and calendar system

**Database.**
- Push Subscription Records — device tokens, linked to participant record
- Notification Preferences — channel/topic opt-ins per participant

**Risks.** Web push has historically had inconsistent iOS Safari support (improved in 16.4+, but needs verification testing). Offline-cached civic content can go stale and mislead if not clearly timestamped. RTL mobile rendering bugs are easy to miss without dedicated Farsi-reader testing. Pressure to "just build an app" for legitimacy reasons should be explicitly resisted unless a concrete capability requires it.

**Future Expansion.** Native app development deliberately deferred, not rejected — worth reconsidering only if a V3 institutional partner requires white-label distribution, or a specific capability (deep offline sync, biometric-gated identity) proves impossible on the web. A nearer-term extension: an SMS/WhatsApp fallback channel for reminders, matching how some low-connectivity Farsi-speaking users already communicate.

---

## 15. Future Roadmap (2026–2030)

**Goals.** Extend the established Phase 0 → MVP → V2 → V3 roadmap into a concrete year-by-year view through 2030, making explicit not just features but team size, funding mix, and the high-stakes bets the organization must consciously decide at each stage — a realistic, non-hockey-stick picture for the board and funders.

**User Value.** Citizens benefit from a platform that grows in capability roughly in step with the organization's actual capacity to maintain trust and quality — not one that overpromises AI features before they're groundable, or expands languages before moderation infrastructure exists to support them safely.

**UX.** Year to year, user-facing surface area grows in the order features were introduced: static content and explainers (2026), a conversational Copilot (late 2026), structured input and a personalized pathway view plus full event lifecycle and mobile PWA (2027–2028), and — contingent on validation — embeddable dialogue widgets and partner-branded experiences (2029–2030). No year introduces a UX paradigm shift.

**Backend Architecture — phase by phase.** 2026 H2: Phase 0 hardening completes; MVP Copilot ships on Static Core + AI Retrieval Layer, ~1–2 FTE. 2027: MVP validated; V2 planning begins; team grows toward 3 FTE; first Personalization & Identity components (accounts-lite, saved pathways). 2028: V2 ships in full — structured participation, event lifecycle, mobile PWA, moderation infrastructure; team reaches 4–5 including a dedicated community/moderation hire. 2029: V2 matures under real load; first 1–2 institutional pilots test the V3 model without full commitment. 2030: if pilots validate, V3's API/embed layer and multi-tenant partner infrastructure are built; team reaches 6–8.

**AI Components — evolution.** 2026: single-purpose grounded retrieval Copilot, narrow and conservative. 2027–2028: retrieval extends across structured input and personalization signals, plus moderation-assist AI for multilingual dialogue. 2029–2030: as model capability and cost improve, previously infeasible ideas become re-evaluation candidates — cheaper multilingual reasoning could make deeper Farsi dialogue bridging tractable, and AI-assisted synthesis could support longitudinal civic-effect measurement across years of events. Every expansion still passes through the same discipline established at MVP: grounded, conservative, human-reviewed.

**APIs — surface evolution.** 2026: internal Copilot query API only. 2027: registration, notification, and personalization APIs (V2 groundwork). 2028: full event-lifecycle and moderation APIs; mobile push APIs. 2029: partner-facing pilot APIs (limited, hand-integrated). 2030: public/self-serve embed & API layer for institutional partners (contingent).

**Database — evolution.** 2026: none (fully static). 2027: first transactional store — minimal identity, saved pathways. 2028: event/registration/outcome data, moderation queues, notification logs. 2029: longitudinal outcome/effect-measurement schema accumulating multi-year data. 2030: multi-tenant partner data model (contingent on V3 commitment).

**Risks.** The largest open bets: (1) whether and when to expand beyond DE/EN/FA — each added language multiplies moderation and grounding burden; (2) whether to pursue V3's institutional-infrastructure model at all, since municipality/university contracts could pull mission focus toward client servicing; (3) how much AI capability improves over 4+ years — an opportunity but also a risk if competitors use off-the-shelf AI to enter civic-tech faster than a small nonprofit can; (4) whether funding successfully diversifies or the org remains grant-dependent and fragile through 2030.

**Future Expansion.** Beyond 2030, the honest answer is contingent: if V3 validates, Res Publica becomes genuine civic dialogue infrastructure for other institutions, with the current site as one tenant among several. If it doesn't validate, the equally successful outcome is a smaller, deeply trusted DE/EN/FA civic AI resource that never needed to become a platform — the roadmap treats that as a legitimate destination, not a failure mode.
