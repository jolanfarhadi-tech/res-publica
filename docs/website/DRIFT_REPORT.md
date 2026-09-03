# Website Drift Report

## Current audit — 2026-09-03

**Repository baseline:** `0466ae567f16d3311ed8b1136a0710f713273b77`
**Scope:** public website copy, collection provenance, terminology,
localisation, legal transparency, and tracked configuration documentation.

### Summary

No unreviewed collection item is publicly surfaced, and the DE/EN/FA content
trees are structurally complete. One public legal-transparency blocker remains.
The other findings are intentionally suppressed content or unrendered legacy
copy; they must not be made public merely to eliminate a drift finding.

### Blocker — public privacy notice is technically stale

- **Affected file:** `datenschutz.md`.
- **Evidence:** `docs/legal/PRIVACY_NOTICE_REPLACEMENT_DRAFT.md` records that
  the live statement that no user profiles are created is no longer accurate.
  The deployed implementation includes OIDC authentication, private
  membership/profile records, versioned confirmations, event registration,
  scoped authorization, AuditLog, rate limiting, and PostgreSQL persistence.
- **Required resolution:** controller and qualified privacy/legal review must
  approve legal bases, retention and erasure periods, processor/DPA and
  transfer language, rights handling, contact details, and cookie/storage
  wording before the replacement draft can be published.
- **Safe status:** do not publish the draft or claim legal completeness.

### Major — legacy and demo collection entries lack public provenance

- **Affected files:** all locale variants of these source slugs:
  `events/forum-demokratie-2026`, `events/werkstatt-teilhabe`,
  `news/forum-anmeldung`, `news/start-website`, `news/website-launch`,
  `projects/buergerdialog`, `projects/offene-daten`,
  `publications/jahresbericht-2025`,
  `publications/stellungnahme-beteiligungsgesetz`,
  `research/beteiligung-wirkung`, and `research/digitale-oeffentlichkeit`.
- **Evidence:** they lack one or more required frontmatter fields:
  `visibility: "public"`, `reviewed: true`, and a non-empty `source`.
- **Current protection:** `src/lib/collections.ts` suppresses every such item
  from indexes, detail pages, search, RSS, sitemap, and static parameters.
- **Required resolution:** owner review of provenance, authorship, dates,
  claims, publication rights, and DE/EN/FA equivalence for each item. Do not
  bulk-mark items public.

### Resolved — retired, unrendered platform-foundation copy removed

- **Affected files:** `src/i18n/dictionaries/de.json`,
  `src/i18n/dictionaries/en.json`, and `src/i18n/dictionaries/fa.json` under
  `platformFoundation`.
- **Evidence:** no current TypeScript component reads this dictionary section;
  its `badge` text is therefore not a public interface element. The section
  describes a former platform-foundation presentation rather than the current
  WHY / HOW / WHAT / JOIN public narrative.
- **Resolution:** the unused section was removed from all three dictionaries.
  `src/i18n/dictionaries.test.ts` now verifies that no locale retains it. The
  current WHY / HOW / WHAT / JOIN public narrative remains the sole public
  presentation; no legacy platform inventory was restored.

### Minor — repository configuration template was stale and ignored

- **Affected files:** `.gitignore`, `.env.example`, and `README.md` in the
  current uncommitted worktree.
- **Evidence:** `.env.example` was covered by `.env*`, was not tracked, and
  still described a pre-runtime configuration shape. The actual repository has
  PostgreSQL, OIDC, session, newsletter and fail-closed operational gates.
- **Current remediation:** the safe template is unignored, contains blank
  placeholders only, and documents closed gate defaults. A secret scan passed.
- **Required resolution:** review and commit this bounded documentation/template
  change separately; do not add a real `.env` file.

### Verified non-findings

- `src/content/en` and `src/content/fa` have no missing or extra files relative
  to `src/content/de`.
- HARM is the sole source-reviewed public collection entry. Its DE/EN/FA
  variants declare public visibility, review, and
  `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` as source.
- No public score, rank, leaderboard, badge, or reputation mechanism was
  found. The remaining matches are explicit prohibitions, a normal-language
  use of “points”, an unused dictionary key, or local search relevance code.
- Canonical `Responsibility Evidence` terminology is consistent in HARM and in
  DE/EN/FA public-method copy.
- No unsupported participant, budget, impact, KPI, or partnership figure is
  active in public collection content.

### Intentionally excluded local/generated files

`.claude/settings.local.json`, `.claude/worktrees/`, `.next/`, `node_modules/`,
`next-env.d.ts`, and `tsconfig.tsbuildinfo` remain ignored. They are local or
generated, not source-control drift. `tsconfig.json` is unchanged. The
root-level `tatus` file is absent from the current worktree.

### Next actions requiring approval

- Obtain legal approval before replacing `datenschutz.md`.
- Review each legacy collection entry individually before adding public
  provenance metadata.
- Review the uncommitted environment-template documentation slice before it is
  staged or committed.

**Date:** 2026-07-29

## Result

No blocking content, terminology, product-classification, or constitutional
drift was found.

## Verified checks

- **Institutional identity:** public copy reflects the signed Satzung's
  charitable purposes, political independence, political education,
  intercultural dialogue, digital governance, democratic innovation, civic
  self-organisation, and cooperation boundaries.
- **Membership:** ordinary and supporting membership remain the only
  statutory membership classes presented as such. Volunteer, research, and
  institutional options are labelled as participation relationships. The
  board's admission decision remains explicit.
- **HARM:** presented only as a reviewed research project and methodology in
  development. It is absent from Products.
- **RPCS / Civic School and Civic Fellowship:** presented only as documented
  programmes and not as launched courses or products.
- **Lab:** presented as a website collection and research/innovation
  environment, not as a separately incorporated research organization.
- **Products and services:** only implemented interfaces and real contact,
  membership, event, and search capabilities are listed. Internal
  infrastructure is not marketed.
- **Claims:** no impact figures, testimonials, public member profiles,
  partnerships, team identities, awards, or launched publications/events were
  invented.
- **Provenance:** collection content remains public only when visibility,
  review, and source are explicit. The new HARM project entry passes that gate
  in DE/EN/FA.
- **Publishing Authority:** no public write request was added; it remains a
  protected human-accountability layer and no-auto-publish boundary.
- **Consent and privacy:** optional categories begin disabled; necessary
  storage is immutable; legal labels and links are localized.
- **Internationalization:** the new narrative, Lab, privacy settings, forms,
  HARM project, legal labels, and empty states have DE/EN/FA parity.
- **Zero gamification:** no points, rank, leaderboard, streak, reputation
  score, or competitive badge mechanic is present.
- **Automated terminology scan:** zero live occurrences of retired
  terminology.
- **Documentation links:** 189 documentation files scanned, zero broken
  Markdown links.

## Deliberate exclusions

- Contact remains a truthful localized email action because no verified
  contact-submission backend exists.
- No research-participation intake form is exposed because no approved
  collection purpose, retention path, consent record, or receiving workflow
  exists.
- Unreviewed legacy/demo MDX remains excluded from search, RSS, sitemap,
  indexes, and static generation.
- The signed Satzung PDF is not copied into the repository because it contains
  signatures and personal data.
