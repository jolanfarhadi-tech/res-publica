# Res Publica — Project Memory

*A narrative summary of the approved Foundation, for a reader (human or AI agent) who needs the whole shape of the project in one sitting before diving into any single detail document.*

## What Res Publica is

A real German civic organization for democracy, dialogue, research, and public participation. Trilingual (German primary, English, Persian/Farsi RTL). Nonprofit, grant-funded. Measures success by civic effect, never attention. Full detail: `MISSION.md`.

## What it's becoming

An AI-first civic platform — not a website with a chatbot bolted on, but a platform where AI makes the organization's existing trustworthy, sourced content radically more reachable: grounded question-answering, cross-collection synthesis, translation-gap detection, structured participation tooling. AI never originates an institutional position; every AI output traces to a named human sign-off. Full detail: `VISION.md`, `PRODUCTS/product-vision.md`.

## How the platform is structured

Three tiers (Static Core, unchanged and fast; AI Retrieval, a read layer; Personalization & Identity, opt-in and introduced last), twenty modules (nine MVP, eight V2, one V3), one shared domain model (six canonical entities: Person, ConsentRecord, Payment, Organization, Notification, AuditLog), and one plugin/manifest contract so new modules never require modifying Core Platform's internals. Full detail: `BLUEPRINTS/foundation-architecture.md`, `MODULE_INDEX.md`.

## How the work got here

The project moved through eight major phases this session, each building on and cross-checking the last: an Engineering + Security Audit of the live repo → a prioritized Implementation Plan → a 15-section Product Vision → an emotional Experience Blueprint → a 15-subsystem Operating System → a reconciled 20-module Master Product Blueprint → a build-ready MVP Module Blueprint → a Foundation Architecture document unifying the domain model and adding the agent/CLI/plugin scaffolding. Full detail: `CHANGELOG.md`.

## Why three separate reconciliation passes happened, and why that's a good sign

Each major synthesis document was produced by parallel specialist teams working from a shared brief — fast, but prone to the same real-world concept being independently defined more than once. The Master Product Blueprint's own reconciliation caught two hard errors (a circular module dependency, a phase-order conflict). The Foundation Architecture document's domain-model unification caught five duplicated entities. The Foundation Review — an explicit, dedicated review gate — caught six further issues, including two of the domain-model fix's own gaps recurring in a different module (Admin Portal independently re-duplicating what Publishing and Fellowship System already owned). Foundation Stabilization closed all ten. This pattern — each pass catching what the last one missed — is the process working as intended, not evidence of instability. Full detail: `DECISIONS.md`, `../FOUNDATION_REVIEW_FINAL.md`.

## Where things stand right now

Foundation Architecture v1.0 is **approved**, committed (`2c2dedb`), pushed to `origin/main`, and tagged `foundation-v1.0`. This `/brain` directory is the migration of that approved Foundation into a permanent, navigable Single Source of Truth. Two items remain as explicit Phase 1 prerequisites rather than Foundation gaps: legal sign-off on the GDPR-erasure pattern, and actually applying the four original P0 code fixes to the live repository (confirmed, by direct inspection, still unresolved as of this migration). Full detail: `ROADMAP.md`.

## What has deliberately not been done yet

V2 module blueprints (Fellowship System, Academy, Speech/Writing Academy, News Analysis Lab, Research Lab, Store, full Admin Portal) have not been detailed to build-ready depth — this was an explicit, cost-conscious decision to stabilize the Foundation first rather than compound unreviewed detail on top of it. No application code has been written or fixed for any of this session's architecture. Full detail: `ROADMAP.md`.
