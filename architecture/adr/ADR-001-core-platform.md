# ADR-001: Core Platform — Three-Tier Architecture

## Context

Res Publica's existing production site is a fully static Next.js application: MDX content in Git, no CMS, no database, no user accounts. It has real, hard-won strengths — fast static rendering, strong SEO/i18n guarantees, and a Git-review-based trust model appropriate for a civic organization whose credibility depends on every published word having passed through a reviewed commit. The Product Vision and Operating System both call for adding AI-assisted grounding, retrieval, and personalization on top of this — capabilities the current architecture has no place for.

## Decision

Adopt a three-tier architecture:

- **Tier 1 — Static Core** (unchanged): MDX-in-Git, build-time rendering, existing SEO/i18n/accessibility guarantees. Nothing in Tiers 2 or 3 may slow or block Tier 1's page-render path.
- **Tier 2 — AI Retrieval Layer** (new): a vector store and knowledge graph derived deterministically from the same Git-committed MDX, plus a grounded RAG query service. A cache and read-layer, never a second source of truth.
- **Tier 3 — Personalization & Identity Layer** (new, opt-in): the platform's first stateful, privacy-sensitive layer, introduced last and only for the specific modules (Membership, Events, Community, CRM, Dashboard) that genuinely require identity or consent state.

## Alternatives Considered

- **A full rewrite onto a dynamic CMS/framework.** Rejected — this would discard the Git-based editorial review trust model and the static site's SEO/speed strengths, both of which are genuine competitive assets for a civic-trust organization, in exchange for capabilities that can be added incrementally instead.
- **Add AI capability directly inside Tier 1's render path**, with no separate service layer. Rejected — this would couple every public page's render time and reliability to AI/vector-store availability and cost, which is precisely the failure mode the tiering exists to prevent.
- **Introduce the personalization database before the AI layer.** Rejected — personalization has little value without AI-Layer-quality content matching to personalize against, and introduces real GDPR/PII risk earlier than the platform actually needs it.

## Consequences

Every module built on this architecture must respect tier boundaries: a Tier 3 module failing (Dashboard, CRM, Analytics) must never block Tier 1 or Tier 2 from functioning. Operational complexity increases — a vector store and a managed Postgres instance now sit alongside the existing static host, each with its own uptime and cost profile to manage.

## Future Impact

This tiering is the precondition for the Plugin Architecture (ADR-003): modules declare which tier they extend via a manifest, rather than reaching directly into another tier's internals. Any future architectural change (a fourth tier, a tier boundary being redrawn) should be evaluated against whether it preserves the "Tier 1 never waits on Tier 2 or 3" guarantee, since that guarantee is what makes the platform's core civic-access promise — content stays available and fast regardless of what else is happening — durable as the system grows.

## Amendment (Foundation Stabilization)

Direct inspection of the live repository during Foundation Stabilization confirmed that the original Engineering Audit's P0 finding (a dead, broken duplicate locale-routing file, `proxy.ts`) and the Security Audit's P0 finding (no rate limiting on the newsletter endpoint) remain unresolved. Both affect Core Platform directly, predate this session's architecture work, and have been re-sequenced as Step 0 of the Foundation Build Order (Foundation Architecture, Section 9) — ahead of the Core Domain Model work, not after it. This does not change this ADR's decision; it closes a gap between the decision and the live implementation's actual state.
