# Res Publica — Constitution

*The standing principles that govern every module, every feature, and every future decision on this platform. These were established progressively across the Product Vision, Operating System, Master Product Blueprint, and Foundation Architecture, and were never contradicted once established — that consistency is itself the evidence that these are load-bearing, not incidental. This is the canonical statement of them. Every other document in the Brain assumes a reader already knows these.*

## 1. AI retrieves, translates, connects, and drafts — it never originates an institutional position

Every AI-generated answer must trace to a specific, published, human-authored source. An AI system may draft a translation, a synthesis, or a narrative connection between existing content — but nothing it produces is published, and nothing it says is treated as Res Publica's own voice, without a named human's sign-off. When no source supports an answer, the system refuses rather than improvises. This is the platform's core trust mechanism; violating it once is worse than never building the feature that would have violated it.

*Canonical detail: `KNOWLEDGE/operating-system.md` §3 (AI Architecture); `BLUEPRINTS/foundation-architecture.md` §3; `../architecture/adr/ADR-008-ai-layer.md`.*

## 2. Zero gamification, anywhere

No points, badges, streaks, leaderboards, or progress bars framed as scores — not in the Community ladder, not in the Dashboard's Impact Tracker, not in the Fellowship System, not anywhere else, present or future. This was tested repeatedly against real temptations (Fellowship nomination signals, Academy course completion, dialogue participation) and held every time. The org's own brand and mission depend on this restraint being genuinely permanent, not a placeholder for "gamification we'll add once we have more users."

*Canonical detail: `PRODUCTS/product-vision.md` §7, §9; `KNOWLEDGE/operating-system.md` §9, §10.*

## 3. Personalization is opt-in; anonymous use is always fully preserved

No feature may require identity disclosure to deliver its core value. The Tier 3 Personalization & Identity Layer is introduced last, deliberately, and every module built on it must offer a genuine anonymous path. GDPR discipline (data minimization, EU residency, revocable purpose-scoped consent) applies to every piece of personal data the platform ever holds.

*Canonical detail: `BLUEPRINTS/foundation-architecture.md` §2 (Core Domain Model — `Person`, `ConsentRecord`); `../architecture/adr/ADR-002-domain-model.md`.*

## 4. Success is measured by civic effect, never by attention

"Did a dialogue happen that wouldn't have otherwise; did a decision become better informed" — not session duration, click-through rate, or time-on-site. This principle directly shaped the Analytics module's scope (Recommended Improvements explicitly forbid attention metrics) and the Business Model's rejection of ad-driven or growth-hacked revenue.

*Canonical detail: `PRODUCTS/product-vision.md` §14; `BLUEPRINTS/master-product-blueprint.md` §18; `BLUEPRINTS/mvp-module-blueprint.md` §9.*

## 5. The Static Core stays untouched and fast; AI and identity are layered beside it, never inside its trust boundary

Tier 1 (Git-committed MDX, static rendering) is the platform's foundation and its primary source of institutional trust — every published word has passed through a reviewed commit. Tier 2 (AI Retrieval) and Tier 3 (Personalization & Identity) are additive layers that must never slow, block, or compromise Tier 1's guarantees.

*Canonical detail: `../architecture/adr/ADR-001-core-platform.md`; `BLUEPRINTS/foundation-architecture.md` §1.*

## 6. Offline-first / graceful degradation is a platform-wide property, not a local-dev convenience

Every module must define what happens when its dependency is unavailable, not just its happy path. The AI Layer falls back to keyword search rather than failing outright; the Local Development Workflow deliberately mirrors this same degradation path so it's routinely exercised, not just tested during real incidents.

*Canonical detail: `../architecture/adr/ADR-010-offline-first-development.md`; `../architecture/adr/ADR-006-local-development-workflow.md`.*

## 7. Trilingual discipline: genuine re-narration, not flat translation

German is source-of-truth; English and Persian (RTL) are not translations of German, they are separately-reasoned-about experiences for genuinely different audiences (German: institutionally fluent; English: comparative/outside-observer; Farsi: trust-and-independence-first, given real diaspora safety stakes). This applies to the Storytelling System, the Orientation Engine, and the Community Engine's three distinct evangelism mechanics alike.

*Canonical detail: `PRODUCTS/product-vision.md` §4, §5, §7.*

## 8. Nonprofit resourcing realism

Every architectural choice assumes a 1–3 engineer team growing toward 6–8 FTE by 2030, grant-funded, not VC-backed. This is why the ECC Agent System is adopted incrementally rather than all-at-once, why a single EU region suffices rather than multi-region replication, and why the CLI/Plugin Architecture exist at all — they're the leverage a small team needs to safely grow to 20 modules, not process for its own sake.

*Canonical detail: `KNOWLEDGE/operating-system.md` §15; `../architecture/adr/ADR-003-plugin-architecture.md`, `ADR-004-ecc-agent-system.md`, `ADR-005-cli-architecture.md`.*
