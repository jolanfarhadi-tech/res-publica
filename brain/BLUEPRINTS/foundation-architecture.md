# Res Publica — Foundation Architecture Document

*This document exists because the Master Product Blueprint and MVP Module Blueprint specified 9 modules independently — and independence at the module level hides duplication and missing connective tissue at the system level. This document supplies that missing layer: one domain model instead of nine overlapping ones, one map of how modules actually talk to each other, and the engineering-support scaffolding (agent roster, plugin contract, CLI, local dev workflow) needed to build all of it consistently. No code, no files created — everything below is planning, per instruction. Nothing here is implemented yet.*

---

## Table of Contents

1. MVP Architecture Blueprint
2. Core Domain Model
3. ECC Agent System
4. Plugin Architecture
5. CLI Architecture
6. Local CLI Workflow (Offline/Local Development)
7. Module Connections — the Integration Map
8. Foundation-Level Validation Checklist
9. Foundation Build Order
10. Risks
11. What Must NOT Be Built Now

---

## 1. MVP Architecture Blueprint

### System overview

Three tiers, nine modules, one domain model. Tier 1 (Static Core) renders Website & CMS. Tier 2 (AI Retrieval Layer) hosts the Knowledge Graph and AI Layer. Tier 3 (Personalization & Identity) is the first stateful layer, introduced specifically because Membership System, Events, Community, CRM, and Dashboard all require real identity/consent state to function. Publishing and Analytics sit across tiers — Publishing writes into Tier 1's content tree using Tier 2's AI drafting; Analytics reads from every tier without writing back into any of them.

### Proposed folder structure

A plain-language layout, extending (not replacing) the existing `src/app/[locale]`, `src/content`, `src/lib` structure already in the repo:

```
res-publica/
├── src/
│   ├── app/[locale]/            existing — Tier 1 public routes
│   ├── content/                 existing — Git-sourced MDX, unchanged
│   ├── lib/                     existing — content loaders, i18n, search
│   ├── components/              existing — Design System / Component Library
│   ├── modules/                 NEW — one directory per MVP module
│   │   ├── knowledge-graph/     entity extraction, relationship inference
│   │   ├── ai-layer/            RAG query service, cost governance, translation-gap
│   │   ├── publishing/          intake, moderation queue, draft authoring, sign-off
│   │   ├── community/           ladder rules engine, evangelism mechanics
│   │   ├── membership/          tiers, pledges, payment plumbing (shared)
│   │   ├── events/              registration, waitlist, event-scoped Q&A
│   │   ├── dashboard/           module manifest, digest composition
│   │   ├── crm/                 donor/partner/funder records, disclosure workflow
│   │   └── analytics/           metrics, cost telemetry, impact sourcing
│   ├── domain/                  NEW — the Core Domain Model (Section 2), shared by all modules
│   │   ├── person/              canonical identity, referenced by every module
│   │   ├── consent/              canonical consent record, purpose-scoped
│   │   ├── payment/              canonical payment/transaction model
│   │   ├── organization/         canonical org record (partner/funder/institutional supporter)
│   │   ├── notification/         canonical notification/delivery entity — added per Foundation Review
│   │   └── audit/                canonical append-only provenance ledger
│   └── cli/                     NEW — Section 5
├── scripts/                      existing — check-structure.mjs, extended with new guards
└── architecture/                 NEW — repo root, not docs/ (corrected per Foundation Review)
    └── adr/                      ADRs and Foundation review documents live here
```

The `domain/` directory is the single most important addition: it is where the Core Domain Model in Section 2 physically lives, so that `modules/community/` and `modules/membership/` both *reference* `domain/person/` and `domain/consent/` rather than each quietly re-defining their own version.

### Environment/deployment architecture

Tier 1 remains Vercel static/ISR, unchanged. Tier 2 adds one hosted vector store (co-located in the EU for data-residency consistency with Tier 3) and one serverless RAG query endpoint. Tier 3 adds one managed Postgres instance, EU-resident, holding the Core Domain Model's `person`, `consent`, `payment`, `organization`, and `audit` tables plus each module's module-specific tables. Payment processing (Membership, and later Events/Store) routes through a single PCI-scope-minimizing payment provider integration owned by the domain-level `payment` model — not re-integrated per module.

### Foundation-level validation checklist

- [ ] Every one of the 9 MVP modules imports `person`, `consent`, `payment`, and `organization` from `domain/` rather than defining a local equivalent
- [ ] A new engineer can read this document plus the Core Domain Model and correctly predict which module owns a given piece of data without reading module source code
- [ ] The EU-resident Tier 3 database's data-residency configuration is verified before any real participant PII (Events) or payment data (Membership) is stored
- [ ] The folder structure above exists as a written convention doc (`architecture/`, at repo root) that new module directories are checked against before being merged

### Risks

- Building `modules/` before `domain/` exists risks nine independent teams (or one team working in nine independent sittings) re-inventing overlapping entities exactly as happened across the five parallel drafting groups that produced the Master Product Blueprint.
- A shared payment integration is a single point of failure; it must be built once, correctly, with proper error handling, before either Membership or Events depends on it.
- The `architecture/` convention only has teeth if it's actually checked — pair it with a lightweight structure guard in CI, extending the existing `check-structure.mjs` pattern, not a purely aspirational document.
- **Confirmed via direct repository inspection during Foundation Stabilization**: the original Engineering Audit's P0 finding (a dead, broken duplicate locale-routing file, `proxy.ts`) and the Security Audit's P0 finding (no rate limiting on the newsletter endpoint) both remain unresolved in the live repository as of this pass. These predate this session's architecture work and affect Core Platform directly — see the revised Foundation Build Order (Section 9).

### What must NOT be built now

- No `modules/fellowship`, `modules/academy`, `modules/store`, `modules/research-lab`, `modules/news-analysis-lab`, or `modules/public-api` directories yet — those are V2/V3 and creating empty scaffolding for them now invites premature coupling.
- No multi-region Tier 3 database replication — a single EU region is sufficient at MVP scale and adds real operational complexity a 1–3 engineer team shouldn't take on yet.

---

## 2. Core Domain Model

### Why this section exists

The nine MVP module specs were drafted by five independent teams working in parallel from a shared brief. That process already caught two hard errors (the Membership↔Store circular dependency, the Analytics↔Fellowship phase conflict). A closer pass reveals a quieter, equally real problem: **the same real-world concept was independently defined as a different entity in more than one module.** Left alone, this produces duplicate records, inconsistent consent state, and payment data split across two tables that should be one. This section is the fix.

### Duplication found, and the resolution

| Concept | Independently defined in | Resolution |
|---|---|---|
| **A person** | Core Platform's `IdentityAccount`, Community's `CommunityMember`, Membership's `Member`, Events' `Attendee Record` | One canonical `Person` entity in `domain/person/`. Each module keeps a thin, module-specific *profile* record (community standing, membership tier, attendance history) that references `Person` by ID — it does not duplicate name/contact/locale data. |
| **Consent** | Core Platform's `ConsentRecord` (GDPR state), Community's `ConsentRecord` (tracking/invitation consent) | One canonical `ConsentRecord` in `domain/consent/`, purpose-scoped (a person can grant consent for "tracking," "invitations," "payment processing," "event PII" independently, each a row referencing the same `Person`). Community and Core Platform both read/write this one table by purpose, rather than each owning a separate consent concept. |
| **Money changing hands** | Membership's `PaymentTransaction`, Events' `Payment Record` (via its dependency on Store, which doesn't exist yet at MVP) | One canonical `Payment` entity in `domain/payment/`, referenced by both Membership (recurring pledges) and Events (ticket-adjacent charges, if any exist at MVP — see below). This is also where the shared payment-provider integration lives. |
| **An organization the org has a relationship with** | Membership's `InstitutionalSupporterProfile`, CRM's `InstitutionalPartner` and `GrantFunder` | One canonical `Organization` entity in `domain/organization/`, with a `relationship_type` field (supporter / partner / funder — an org can hold more than one simultaneously). CRM and Membership both reference this one record rather than each maintaining a separate org directory that can drift out of sync. |
| **A record of who approved/touched what** | Publishing's `SignOffRecord`, AI Layer's `QueryLog`, CRM's `ConflictOfInterestDisclosure` review outcome | These remain module-specific in *content* (a sign-off is not the same fact as a disclosure review), but all three should be instances of one canonical, append-only `AuditLog` pattern in `domain/audit/` — same shape (actor, action, target, timestamp, immutable), different `action` values. This makes a single, unified audit trail possible later without redesigning three separate logging mechanisms. |

### The canonical entities

- **Person** — one row per real individual the platform knows about at any level (anonymous sessions are explicitly *not* a Person; a Person exists only once someone is identified, even lightly). Holds name/contact/locale/RTL preference only — nothing role-specific.
- **ConsentRecord** — purpose-scoped, revocable, timestamped; every module that needs consent reads from here, none defines its own.
- **Payment** — a single transaction record type (amount, currency, purpose, provider reference, status), reused by every module that ever needs to move money.
- **Organization** — one row per institutional entity, with a relationship-type field distinguishing supporter/partner/funder roles, which may overlap.
- **Notification** — *(added per Foundation Review)* one canonical delivery record (channel, template, recipient reference, delivery status) for every email/notification the platform sends, replacing what was previously four independent, implicit assumptions inside Events, Membership, Community, and CRM's own API lists. Those four modules now reference this entity rather than each defining their own send/delivery mechanism.
- **AuditLog** — the shared shape for every "who did what, when, and why is it trusted" record across the platform. *(GDPR-erasure resolution, added per Foundation Review: when a referenced Person is erased, `AuditLog` entries are pseudonymized — the actor/target reference is replaced with a redaction placeholder while the action and timestamp facts are retained — consistent with GDPR Article 17(3)'s exception for legitimate accountability/record-keeping purposes. This is a proposed resolution; final sign-off from the organization's legal/data-protection function is still recommended before any AuditLog-writing module reaches Phase 1.)*
- **Content** (already implicit in Website & CMS / Publishing / Knowledge Graph) — the canonical MDX-sourced entry, referenced by the Knowledge Graph's `Entity`/`Relationship` layer and Publishing's `DraftDocument`/`PublishCommit`, rather than each module holding its own partial view of "a piece of content."

### Entity ownership table

| Entity | Owning module | Referenced by |
|---|---|---|
| Person | Core Platform | Community, Membership, Events, Dashboard, CRM |
| ConsentRecord | Core Platform | Community, Membership, Events |
| Payment | Membership | Events (if MVP ticketing requires it — see Section 7) |
| Organization | CRM | Membership |
| Notification | Core Platform | Events, Membership, Community, CRM |
| AuditLog | Core Platform | Publishing, AI Layer, CRM |
| Content | Website & CMS / Publishing | Knowledge Graph, AI Layer, Dashboard |

### Risks

- Retrofitting this model after modules are built independently is far more expensive than establishing it first — this is precisely why the user paused V2 work to ask for it now.
- A canonical `Person` entity is also the platform's single largest privacy-sensitive surface; its access controls need to be stricter than any individual module's own data, since a breach here affects every module at once.
- Over-eager normalization is its own risk: not every module-specific detail belongs in the canonical entities. The line drawn above (canonical = identity/consent/money/organization/audit-shape; everything else stays module-owned) should be treated as deliberate, not as an invitation to keep centralizing further.

### What must NOT be built now

- No speculative fields on `Person` for future modules (no `fellowship_status`, no `academy_progress` columns) — those belong to Fellowship/Academy's own module-specific profile tables when those modules are actually built in V2.
- No cross-organization relationship graph (e.g., "Organization A is a subsidiary of Organization B") — a flat `Organization` record with a relationship-type field is sufficient for MVP; graph-shaped organizational relationships are unneeded complexity right now.

---

## 3. ECC Agent System

### What this is, and what it explicitly is not

This section defines a roster of specialized agents dedicated to building and maintaining Res Publica — a project-specific extension of the same specialist-agent pattern already used throughout this session (Product Strategist, Security Auditor, Software Architect, and so on). **This is a conceptual roster, not implemented agent files.** Formalizing these as real `.claude/agents/*.md` definitions is a separate, later action, not part of this planning document.

### Existing pattern, mapped to what's already available

Several of the roles this project already needs map directly onto agents already available in this environment and don't need new definitions: general code review (`ecc:code-reviewer`), security review (`ecc:security-reviewer`), performance review (`ecc:performance-optimizer`), architecture review (`ecc:architect`), and TypeScript/React-specific review (`ecc:typescript-reviewer`, `ecc:react-reviewer`). These should simply be invoked as-is going forward for their respective concerns.

### The eight new agents, defined

**Responsibility Agent.** Reviews any proposed feature or change against Res Publica's own standing constitutional principles established across this session's work: no gamification anywhere, AI never originates institutional positions, nothing publishes without a named human's sign-off, personalization is always opt-in, anonymous full-site use is always preserved. Inputs: a feature description or diff. Outputs: a pass/fail against each principle, with the specific violated principle named if it fails — not a vague "this feels off." This is the enforcement mechanism for the "What Must NOT Be Built" sections that now appear in every blueprint this session has produced.

**Eco Accountability Agent.** Reviews infrastructure and AI-usage decisions for cost and environmental proportionality appropriate to a nonprofit budget — flags oversized model selection where a smaller tier would do, unnecessary re-embedding of unchanged content, redundant vector-store rebuilds, and hosting choices disproportionate to actual traffic. Directly operationalizes the AI Layer's cost-governance ceiling and extends the same discipline to infrastructure choices the AI Layer doesn't cover.

**Impact Agent.** Validates that every shipped feature has a real civic-effect measurement hook wired into Analytics before being considered complete — and, just as importantly, that no feature has quietly introduced an attention/engagement metric instead. This is the standing guard against the "metric drift" risk flagged explicitly in the Analytics module's own risk list.

**Plugin Architect Agent.** Owns and reviews the extension-point contract defined in Section 4 below — ensures a new module (present or future) can register itself with Core Platform without Core Platform needing to know that specific module's internals. Prevents the "everything imports everything" coupling that would make V2 module additions expensive.

**Design System Agent.** Enforces the existing token and component discipline (the seven design tokens, Fraunces/Vazirmatn typography, RTL-mirroring rules, and the specific AI-attribution visual pattern established in the Operating System's Design System section) on any new UI surface any module introduces. Rejects new one-off components that fork the system rather than extending it.

**CLI Agent.** Owns the CLI defined in Section 5 — adds new commands as modules need them, keeps command behavior consistent (naming, output format, exit codes) across all nine modules' tooling needs.

**Local Dev Agent.** Owns the offline/local development workflow defined in Section 6 — keeps the mocked AI Layer responses, local database seed data, and fallback behavior working as new modules are added, so a contributor without production credentials can still develop against a realistic environment.

**Review & Validation Agent.** Runs the per-module validation checklists already published in the MVP Module Blueprint before any module is marked complete — the actual enforcement mechanism for those checklists, rather than leaving them as an honor-system document nobody re-checks.

### How they fit together

| Agent | Primary trigger | Primary output |
|---|---|---|
| Responsibility Agent | Any new feature/PR | Pass/fail against standing principles |
| Eco Accountability Agent | Infrastructure or model-selection change | Cost/environmental proportionality review |
| Impact Agent | Any feature reaching "done" | Confirms an Analytics hook exists; rejects vanity metrics |
| Plugin Architect Agent | A new module being added | Confirms it uses the extension-point contract, not direct coupling |
| Design System Agent | Any new UI component | Confirms token/RTL/AI-attribution compliance |
| CLI Agent | A module needing new local tooling | Adds/maintains a CLI command |
| Local Dev Agent | Any change to AI Layer, Tier 3, or seed data | Keeps local/offline dev working |
| Review & Validation Agent | A module claiming MVP-complete status | Runs its validation checklist end-to-end |

### Risks

- Eight new named agents is a lot of process for a 1–3 engineer team; if not scoped carefully, the agents themselves become overhead rather than a safeguard. The intent is that most of these run as quick, targeted checks (some could even be a single reusable checklist rather than a full agent invocation) — not a mandatory multi-agent review gauntlet on every commit.
- Overlap between Responsibility Agent and Impact Agent is real (both touch "did this feature do what the org actually wants") — the dividing line drawn above (Responsibility = constitutional principles, Impact = measurement hook existing and correct) should be kept sharp so they don't become redundant.

### What must NOT be built now

- No actual `.claude/agents/*.md` files for any of these eight yet — this section is the specification they'd be built from later, not the implementation.
- No fully automated CI gate blocking merges on all eight agents simultaneously at this stage — that's appropriate once the team and module count justify the overhead, not for a 1–3 engineer MVP team building the first module.

---

## 4. Plugin Architecture

### The core idea

Core Platform should never need to know that "Events" or "CRM" specifically exist. Instead, each module registers itself against a small, fixed extension-point contract, and Core Platform only knows about the contract. This is what makes it possible to add Fellowship, Academy, Store, and the rest in V2/V3 without modifying Core Platform's internals — exactly the property the Master Product Blueprint's dependency map assumed but didn't make explicit.

### The contract, in plain terms

Every module exposes a manifest describing: what Core Domain Model entities it reads or writes, what new database tables it owns, what API routes it registers, what (if any) Dashboard module-manifest entry it contributes, and what AI Layer capabilities (if any) it consumes. Core Platform's job is limited to reading these manifests at build/deploy time and wiring routes/tables accordingly — it does not contain module-specific logic.

### Why this matters for V2

When Fellowship System is eventually built, it should be addable by writing one new module manifest (referencing `Person`, `Organization` from the Core Domain Model, and declaring its own `FellowNomination`/`FellowProfile` tables) — not by editing Community's code to "add Fellowship awareness." The Master Product Blueprint's Connected Modules lists become, in this architecture, a description of which manifests reference which shared domain entities — not direct code dependencies between module packages.

### Risks

- A plugin/manifest system is itself infrastructure that needs building and testing before it pays for itself — for exactly 9 modules at MVP, hand-wiring might feel faster in the short term. The discipline is worth adopting now specifically *because* V2 adds 8 more modules; retrofitting a manifest system after 17 modules exist is much harder than establishing the pattern at 9.
- Over-abstracting the contract (trying to anticipate every possible future module's needs) is its own failure mode — the manifest shape should cover what the 9 MVP modules actually need, and grow deliberately when V2 modules reveal a genuinely new requirement, not speculatively now.

### What must NOT be built now

- No dynamic plugin loading/marketplace concept (installing third-party modules at runtime) — Res Publica's modules are all first-party, built by the same small team; this is an internal code-organization pattern, not a public extensibility platform.

---

## 5. CLI Architecture

### Purpose

A single `respublica` command-line tool giving the small engineering team (and, later, Fellows with technical skills) one consistent interface across all nine modules' local operational needs — extending, not replacing, the existing `npm run dev` / `npm run build` / `npm run check-structure` scripts already in the repo.

### Command set

- `respublica dev` — starts local development, wired to the Local Dev Workflow in Section 6 (mocked AI Layer, seeded local database)
- `respublica build` — production build, unchanged from today's `npm run build` plus the structure guard
- `respublica validate-content` — runs the existing Zod frontmatter validation plus new checks (e.g., confirming a Content entity referenced by the Knowledge Graph still exists)
- `respublica validate-module <module-name>` — runs a given module's validation checklist from the MVP Module Blueprint, the CLI-facing counterpart to the Review & Validation Agent
- `respublica seed-local` — populates the local Tier 3 database with realistic fixture data (fake Person/ConsentRecord/Payment/Organization records) for offline development
- `respublica publish-draft <draft-id>` — the CLI-facing entry point into Publishing's sign-off/commit flow, for an editor working locally
- `respublica graph-rebuild` — manually triggers a Knowledge Graph rebuild from current content, for local testing without waiting for a deploy
- `respublica check-structure` — the existing structure guard, unchanged, folded into the new CLI's namespace for discoverability

### Risks

- A CLI is only useful if it's actually kept in sync with what each module needs — this is exactly the CLI Agent's ongoing job (Section 3), not a one-time build.
- Wrapping existing npm scripts in a new CLI layer adds a small maintenance surface; the CLI should delegate to the existing scripts rather than reimplementing them, to avoid two sources of truth for the same operation.

### What must NOT be built now

- No `respublica deploy` command that bypasses the existing Vercel/CI deployment path — deployment stays exactly as it is today; the CLI is a local-development and validation tool, not a replacement for CI/CD.
- No interactive setup wizard or GUI — a small technical team doesn't need one, and building one is pure V2+ polish with no MVP justification.

---

## 6. Local CLI Workflow (Offline/Local Development)

### The problem this solves

Several MVP modules depend on real, potentially costly, or credential-gated services: the AI Layer's LLM/embedding API calls, the Tier 3 EU-resident production database, and Membership's payment provider integration. A contributor should be able to develop and test most of the platform locally without live credentials for any of these, or without incurring real API cost during routine development.

### The workflow

`respublica dev` boots the site against: a local, disposable database (seeded via `respublica seed-local` with fixture Person/ConsentRecord/Payment/Organization/Content records) instead of the real Tier 3 database; a mocked AI Layer that returns canned, clearly-labeled "MOCK RESPONSE" grounded answers with fake-but-plausible citations, instead of making real LLM calls; and a stubbed payment provider that simulates successful/failed transactions on command, instead of a real payment gateway. Content itself (Tier 1, MDX-in-Git) works identically locally and in production, since it was already designed to be fully static-first — no special local handling needed there.

### Why this matters specifically for this project

Because the AI Layer has a hard monthly cost ceiling (established in its own risk list), routine local development must never silently consume that budget. Mocking is not just a developer-convenience feature here — it is the mechanism that keeps the org's actual nonprofit AI budget spent only on real production usage, not on every engineer's local `npm run dev` session.

### Risks

- Mocked AI Layer responses that are too realistic risk an engineer mistaking mock behavior for production behavior during testing — the "MOCK RESPONSE" labeling needs to be impossible to miss, not a subtle flag.
- Local fixture data can drift from the real Core Domain Model's actual shape over time if not regenerated alongside schema changes — this is exactly the Local Dev Agent's ongoing responsibility.

### What must NOT be built now

- No fully offline-capable AI Layer (a locally-run small model as a stand-in) — a clearly-labeled mock is sufficient for MVP; building genuine offline AI capability is real infrastructure work with no MVP justification.
- No local-first data sync between the disposable local database and production — local data is disposable and fixture-based, on purpose, never intended to sync anywhere.

---

## 7. Module Connections — the Integration Map

This is the connective tissue the Master Product Blueprint's per-module "Connected Modules" lists implied but never drew out as one picture.

| From module | To module | What flows | Sync or async |
|---|---|---|---|
| Website & CMS | Knowledge Graph | Published Content entities, at build/commit time | Async (build-time) |
| Knowledge Graph | AI Layer | Entity/relationship data for grounding | Sync (query-time read) |
| AI Layer | Publishing | Draft synthesis, translation-gap flags | Sync (on-demand) |
| Publishing | Website & CMS | Approved, signed-off Content, via Git commit | Async (deploy-time) |
| Website & CMS | Community | Content-engagement signals (with consent) | Sync (on page view, opt-in only) |
| Community | Dashboard | Ladder stage, for module-manifest personalization | Sync (on dashboard load) |
| Events | Community | Real-world-touchpoint triggers (a registration is a ladder signal) — *(direction corrected per Foundation Review; was previously written backwards)* | Async (event-driven) |
| Membership | Community | "Recurring supporter" stage confirmation | Async (event-driven) |
| Membership | CRM | New institutional-tier signups become CRM `Organization` records | Async (event-driven) |
| Membership | Analytics | Recurring pledge / tier data, for participation-per-subscriber and revenue-adjacent reporting — *(row added per Foundation Review; previously missing despite being a declared dependency)* | Async (batch/periodic) |
| Events | Dashboard | Upcoming/attended events, for the Dashboard's event module | Sync (on dashboard load) |
| Events | Analytics | Registration/attendance/outcome data, for participation metrics | Async (batch/periodic) |
| AI Layer | Analytics | Cost/usage telemetry | Async (continuous) |
| Community | Analytics | Ladder-stage transition events, for participation-per-subscriber | Async (batch/periodic) |
| CRM | Website & CMS | Approved funding-source disclosures, for the public disclosure page | Async (manual publish action) |
| Domain (`Person`, `ConsentRecord`, `Payment`, `Organization`, `AuditLog`) | All modules | Shared identity/consent/payment/org/audit state | Both — read-heavy sync, write-heavy async |

The pattern worth naming explicitly: **Website & CMS, Knowledge Graph, and AI Layer form the "content and grounding" spine; Community, Membership, and Events form the "participation and relationship" spine; Dashboard, CRM, and Analytics are consumers that sit downstream of both spines, never upstream of them.** No module in the downstream layer should ever need to be consulted before an upstream module can function — Dashboard, CRM, and Analytics failing or being unavailable must never break content publishing, grounding, or participation.

### Risks

- The "downstream consumers never upstream" rule is easy to violate accidentally — e.g., if Dashboard's rendering logic somehow became a required step in Community's ladder-transition logic, a Dashboard outage would incorrectly block real participation tracking. This needs to be an explicit architectural test, not just a stated intention.
- Async, event-driven connections (most of the table above) need a real, monitored event/queue mechanism — if these are implemented as ad hoc direct calls instead, the "async" property is fictional and failures cascade synchronously anyway.

### What must NOT be built now

- No synchronous, request-blocking calls from Website & CMS into Community, Events, or any participation-tracking module — public page rendering must never wait on participation infrastructure, preserving Tier 1's speed guarantee.
- No direct module-to-module database access bypassing the Core Domain Model — every cross-module data need shown in the table above should go through the shared `domain/` entities or an explicit API, never a module reaching directly into another module's private tables.

---

## 8. Foundation-Level Validation Checklist

- [ ] Every entity duplication identified in Section 2 has been resolved in the actual module specs (Membership, Events, CRM updated to reference canonical `Person`/`Payment`/`Organization` rather than their own copies)
- [ ] The Plugin Architecture's manifest shape has been validated against all 9 MVP modules' actual needs — no module requires a capability the manifest contract doesn't support
- [ ] The Local Dev Workflow has been tested by a contributor with zero production credentials, confirmed able to run `respublica dev` and reach a working, clearly-mocked local instance
- [ ] The Module Connections table's "downstream consumers never upstream" rule has been verified by confirming Website & CMS renders correctly with Community, Events, Dashboard, CRM, and Analytics all simulated as unavailable
- [ ] At least one new team member (real or simulated) can correctly answer "which module owns X" for every Core Domain Model entity using only this document

## 9. Foundation Build Order

0. **Apply the original Engineering Audit / Security Audit P0 fixes to the live repository** — delete the dead, broken duplicate locale-routing file (`proxy.ts`), add content-read caching, sanitize slugs and set `dynamicParams = false` on collection detail routes, add rate limiting to the newsletter endpoint. Confirmed NOT YET applied as of this Foundation Stabilization pass. These affect Core Platform directly and must land before or alongside step 1, not after — re-sequenced here per Foundation Review finding.
1. Core Domain Model (`domain/`) — before any module code, since every module depends on it
2. Plugin Architecture's manifest contract — before the first module is wired into Core Platform
3. CLI Architecture's baseline commands (`dev`, `build`, `validate-content`) — needed to develop anything at all
4. Local Dev Workflow (mocks, seed data) — needed before meaningful local development of AI Layer or Tier 3-dependent modules
5. Then, and only then, the 9 MVP modules in the order already ratified in the MVP Module Blueprint (Knowledge Graph → AI Layer → Publishing → Community → Membership → Events → Dashboard → CRM → Analytics)

## 10. Risks (summary, cross-cutting)

- The single largest risk this whole document exists to manage: **building nine modules independently, as separately-drafted specs, without this reconciliation pass, was already shown this session to produce real errors** (the two corrections in the Master Product Blueprint). This foundation layer is the mechanism that prevents a second, larger round of the same problem once V2's 8 additional modules are drafted.
- The ECC Agent System and CLI/Plugin architecture add real process overhead for a 1–3 person team; the risk of over-building process before there's a team large enough to need it is real and should be watched — these are here because the user explicitly asked for them, not because a lean MVP team strictly requires all eight agents on day one.

## 11. What Must NOT Be Built Now (document-wide summary)

- No V2/V3 module scaffolding, agent implementations, plugin marketplace, deploy-pipeline replacement, offline AI model, or local-to-production data sync — every "what must NOT be built" note above still applies; this section exists so a reader skimming only the end of the document doesn't miss any of them.
- No automated multi-agent CI gate running all eight new agents on every commit — introduce them one at a time, starting with Responsibility Agent and Review & Validation Agent, as the two with the clearest immediate value, before adding the rest.

---

## Next step

With this foundation in place, the remaining V2 Module Blueprints (Fellowship System, Academy, Speech Academy, Writing Academy, News Analysis Lab, Research Lab, Store, full Admin Portal — 8 of the 11 V2/V3 modules not yet detailed at this depth) can now be drafted against a stable Core Domain Model and Plugin Architecture, rather than risking the same kind of cross-module duplication this document just resolved for MVP. Given this document's own scope and the session's cumulative cost, flagging before continuing rather than proceeding automatically.
