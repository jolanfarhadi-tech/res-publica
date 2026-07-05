# Res Publica — Module Index

*All 20 modules from the Master Product Blueprint, one line each. Full detail: `BLUEPRINTS/master-product-blueprint.md` (all 20) and `BLUEPRINTS/mvp-module-blueprint.md` (the 9 MVP modules, build-ready depth).*

## Core (2)

| # | Module | One-line purpose |
|---|---|---|
| 1 | Core Platform | The three-tier substrate (Static Core / AI Retrieval / Personalization & Identity) every other module builds on |
| 2 | Website & CMS | Public-facing static/ISR rendering of all content, cornerstone pages, and the glossary |

## MVP (9, in ratified build order)

| # | Module | One-line purpose |
|---|---|---|
| 12 | Knowledge Graph | Deterministic entity/relationship graph derived from Git-committed MDX; grounds AI Layer and powers cross-collection recommendations |
| 11 | AI Layer | The shared, grounded RAG "Civic Copilot" — cited answers, translation-gap detection, moderator-synthesis assist, cost governance |
| 15 | Publishing | The back-stage editorial pipeline — intake, moderation, AI-assisted drafting, translation, human sign-off, commit |
| 3 | Community | Tracks (with consent) the visitor→participant ladder and triggers per-language evangelism invitations, as a rules engine, never ML-scored |
| 4 | Membership System | Recurring individual/institutional financial support — the broad, low-friction supporter tier |
| 14 | Events | Full event lifecycle — registration, event-scoped grounded Q&A, waitlist, outcome publishing |
| 16 | Dashboard | The personalized home for visitor/participant/Fellow segments — digest, impact tracker, preferences |
| 19 | CRM | Staff-facing donor/partner/funder relationship management and conflict-of-interest governance |
| 18 | Analytics | Civic-effect measurement (participation-per-subscriber, AI cost telemetry) — explicitly never attention metrics |

## V2 (8)

| # | Module | One-line purpose |
|---|---|---|
| 5 | Fellowship System | Human-gated recognition of top-tier contributors (facilitators, reviewers, language leads) — no leaderboard |
| 6 | Academy | Civic-education courses/cohorts building the skills Fellowship depends on |
| 7 | Speech Academy | Dialogue-facilitation and deliberation-skill training, feeding Fellowship's facilitator role |
| 8 | Writing Academy | Civic-writing skill training, feeding Research Lab and Publishing's contributor pool |
| 9 | News Analysis Lab | Media-literacy and fact-checking, both internal editorial tool and public offering |
| 10 | Research Lab | Collaboration space for staff, Fellows, and academic partners producing studies |
| 13 | Store | Modest commerce — event tickets, paid courses, publication editions, methodology licenses |
| 17 | Admin Portal | Full staff control surface consolidating moderation, nomination review, editorial inbox, cost telemetry |

## V3 (1)

| # | Module | One-line purpose |
|---|---|---|
| 20 | Public API | Read-only Knowledge Graph access and embeddable grounded Q&A for institutional/academic partners |

## Cross-module concepts (canonical location)

| Concept | Canonical location |
|---|---|
| Person, ConsentRecord, Payment, Organization, Notification, AuditLog (the shared domain entities) | `BLUEPRINTS/foundation-architecture.md` §2 |
| Module manifest / extension contract | `BLUEPRINTS/foundation-architecture.md` §4; `../architecture/adr/ADR-003-plugin-architecture.md` |
| Module-to-module data flow | `BLUEPRINTS/foundation-architecture.md` §7 |
| The ECC Agent System (8 new specialized agents) | `AGENTS/ecc-agent-system.md` |
