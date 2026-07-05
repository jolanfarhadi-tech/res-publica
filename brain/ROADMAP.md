# Res Publica — Roadmap

*Condensed. Full detail in `BLUEPRINTS/master-product-blueprint.md` §21 (Dependency Map & Build Order) and `KNOWLEDGE/operating-system.md` §15 (Future Roadmap 2026–2030).*

## Phase structure

| Phase | Name | What it proves | Team size (approx.) |
|---|---|---|---|
| Phase 0 | Foundation hardening | The static core is trustworthy enough to build on | ~0.5 FTE |
| MVP | "Grounded Civic Copilot" | Grounded synthesis genuinely deepens engagement, not just click-through | ~1–2 FTE |
| V2 | Structured Participation & Personalized Civic Pathways | Citizens will use structured input tools, not just consume answers | ~3–5 FTE |
| V3 | Civic Infrastructure Platform | Other institutions want to run dialogues on Res Publica's rails | ~6–8 FTE |

## The 9 MVP modules, in ratified build order

Knowledge Graph → AI Layer → Publishing → Community → Membership System → Events → Dashboard → CRM → Analytics.

Full per-module detail (purpose, entities, APIs, AI features, risks, validation checklists): `BLUEPRINTS/mvp-module-blueprint.md`.

## The 11 V2/V3 modules, not yet detailed at build-ready depth

Fellowship System, Academy, Speech Academy, Writing Academy, News Analysis Lab, Research Lab, Store, full Admin Portal (V2); Public API (V3). See `MODULE_INDEX.md` for the complete 20-module list with tier and dependencies, and `BLUEPRINTS/master-product-blueprint.md` for what detail does exist for each.

## Status as of this Brain migration

Foundation Architecture v1.0 is approved, stabilized, committed (`2c2dedb`), and tagged (`foundation-v1.0`). Two items are correctly Phase 1's responsibility, not the Foundation's (see `../FOUNDATION_REVIEW_FINAL.md`):

1. Legal/data-protection sign-off on the `AuditLog`/GDPR-erasure resolution.
2. Actually applying the four original Engineering/Security Audit P0 fixes to the live repository — confirmed still unresolved as of Foundation Stabilization (`proxy.ts` still exists; the newsletter endpoint still has no rate limiting). This is Step 0 of the Foundation Build Order (`BLUEPRINTS/foundation-architecture.md` §9) — it must land before or alongside Core Domain Model implementation work.

V2 module blueprints (matching the depth of `BLUEPRINTS/mvp-module-blueprint.md`) have not yet been produced — deliberately paused after the Foundation Architecture phase, per an explicit session decision to prioritize stabilization first.
