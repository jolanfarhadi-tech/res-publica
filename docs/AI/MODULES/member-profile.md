# Module: Member Profile

## Incremental integration — Application History and truthful wallet gate, 2026-08-10

The protected Profile now consumes the existing self-only Membership
Application projection and displays only requested tier, status, submission
time and decision time. It excludes names, email, address, decision actor,
audit references, board notes and governance reasoning. Applicants with an
open or decided application are directed to their private Dashboard rather
than being told no application exists or offered a duplicate application.

The Dashboard's research-wallet panel now receives a server-derived activation
availability flag from the existing approval gate. A closed gate produces a
truthful read-only state and no activation, recovery, file-upload or revocation
control; browser wallet storage is not inspected. This changes no Wallet API,
credential, verifier or real-data semantics and introduces no migration.

## Incremental integration — Payments and Notifications view, 2026-08-04

The protected Dashboard now completes and deploys the spec's existing Payments and
Notifications view over the canonical entities. Notifications were already
present; Payments are now queried only for the session actor and projected
without provider references or payer identifiers. The localized view is
read-only and introduces no provider, mutation, migration, or new profile-owned
table.

## Incremental integration — protected Dashboard, 2026-07-29

The protected Dashboard reuses `getSelfMemberProfile` as its membership
projection and links to the existing localized Profile page. It does not
change the Profile API, visibility tiers, status semantics, or read-only
self-service boundary. The Dashboard actor is derived from the authenticated
session and cannot select another person.

## Purpose

A read-only, self-facing transparency/participation interface — "the member's personal operating system," answering only "what should I do next?" **Explicitly not a governance decision interface.** Evidence: `docs/source/projects/MEMBER_PROFILE.md` (read in full, prior session), §"Purpose", §"Member Profile Visibility" (Architectural Rule stated four times).

## Incremental implementation — profile creation consent, 2026-07-29

**Verified, unstaged local worktree.** The Membership application that creates
the first member-facing profile now requires two independent confirmations:
data protection and described programme/activity use of profile information.
Both start unchecked; the submit action remains disabled until both are
selected; the API independently requires both literal `true` values.

The confirmation receipt does not create a Member Profile-owned table or
change the read-only profile projection. It reuses ADR-002's canonical
`ConsentRecord`: two locale-specific version-`v1` purposes and one grant
timestamp are written atomically with Membership creation. The localized
data-protection link was browser-verified after separating it from the checkbox
label so navigation does not toggle consent.

## Canonical authority

- `architecture/adr/ADR-034-member-profile-visibility-and-self-service-authorization.md` — visibility tiers + protected self-service authorization. Accepted.
- `docs/source/projects/MEMBER_PROFILE.md` — the full canonical spec (377 lines, read in full prior session): tri-tier visibility (member-facing / internal-administrative / governance-sensitive), Dashboard Domains, Civic Progression System, Opportunity Engine, Personal Civic Roadmap, Activity-to-Status Logic, Membership Compliance.
- References (per that document): `brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md`, `docs/source/academy/RPCS_LEVELS.md`, `docs/source/projects/COMMUNITY.md`, `brain/DOMAIN/CORE_DOMAIN_MODEL.md` (Person/Payment/Notification/ConsentRecord — LOCKED, referenced not modified).

## Current implementation

`src/app/[locale]/profile/page.tsx`, `src/app/api/membership/profile/route.ts` (+`route.test.ts`), `src/app/api/membership/create/route.ts`, `src/i18n/member-profile.ts`, `src/application/member-profile.ts` (+`member-profile.integration.test.ts`), `src/components/platform/MemberProfileDashboard.test.ts` — all confirmed to exist via directory listing this session; **not all read line-by-line**. Committed via `3a75efd` ("feat: add protected member profile self-service") and `a31afef` ("feat: add trilingual member profile interface"), both ≤ `origin/main` tip `7025e6f`.
Per the spec's own `## MVP Status` (read in full): *"the protected, read-only Membership profile slice is implemented according to ADR-034: session-derived self-authorization, query-level ownership enforcement, an allowlisted member-facing projection, and a trilingual DE/EN/FA interface with Persian RTL support."*

## Data and persistence

This module is explicitly a **display layer only** — it does not own any table. It reads from `people` (core, `schema.ts`), `members`/`membershipStatusChanges` (`module-schema.ts` L15, L34), and (per the spec, not yet all wired per its own TODO) `Payment`, `Notification` entities. No dedicated `member_profile`-named table exists or should exist, per the spec's own "does not own the underlying business logic" rule.

## Authorization and trust boundaries

**Tri-tier visibility, binding architectural constraint** (`MEMBER_PROFILE.md`, quoted in full previously): member-facing / internal-administrative / governance-sensitive — "No implementation of this profile may merge the three tiers into a single queryable object... internal-administrative and governance-sensitive data must be excluded at the data-access layer, not merely hidden in the UI." Self-service authorization is session-derived (ADR-034), enforced at the query/projection boundary per the spec's own MVP Status claim — **this specific enforcement claim was not re-verified against the route's source code line-by-line this session**; it is reported as the spec's own self-assessment.

## Public interfaces

`GET`/relevant methods on `src/app/api/membership/profile/route.ts`; `src/app/api/membership/create/route.ts`; UI at `src/app/[locale]/profile/page.tsx`.

## Verification

**Verified 2026-07-29:** focused profile-consent/frontend tests passed 36/36;
the complete suite passed 37 files / 191 tests. Structure, lint, typecheck,
database checks, fresh 12-migration/53-table verification, and the optimized
99-page production build passed. Production-mode browser checks covered
DE/EN/FA copy, default-off state, submit gating, Persian RTL, and localized
data-protection navigation.

**Incremental verification 2026-07-24:** the frontend narrative work did not
change the profile API, projection, status semantics, or dashboard component.
The full suite still passes 168/168. Manual anonymous/unavailable rendering
confirmed a self-facing localized page with `noindex, nofollow`; no score,
rank, badge, governance standing, or public profile was introduced.

Tests confirmed to exist: `src/app/api/membership/profile/route.test.ts`, `src/application/member-profile.integration.test.ts`, `src/components/platform/MemberProfileDashboard.test.ts`. They passed as part of the 35-file / 168-test release suite.

## Decisions and rejected approaches

- Rejected: Member Profile defining its own "Contribution Record Lifecycle" — deliberately not done; reserved for a future, not-yet-ratified "Civic Contribution Framework" (`MEMBER_PROFILE.md` §"Membership Journey").
- Rejected: treating AI Mentor, Skill Graph, Mentorship Platform, Career & Leadership Development, Volunteer & Project Marketplace, Alumni Network as real, buildable systems — named only as an unratified wishlist (`MEMBER_PROFILE.md` §"Community Systems").
- Rejected: any social-media-style framing ("What do you think?", "React to this", "Compete with others") — explicitly forbidden, in favor of action-oriented civic-progression language (`MEMBER_PROFILE.md` §"Opportunity Engine").

## Current status

**PARTIAL** / **REMOTE_VERIFIED** for the implemented first slice. Per the spec's own TODO checklist (`MEMBER_PROFILE.md`, verbatim, read in full):

Done: self-service ownership + tier separation at query/projection boundary (ADR-034 first slice); protected read-only Membership profile API + DE/EN/FA interface; Membership exit/deactivation lifecycle defined; purpose-scoped consent receipts for initial Membership/profile creation; Payments/Notifications view over the canonical entities; the existing Membership Application History projection (requested tier, status and timestamps only); truthful read-only Wallet presentation while its approval gate is closed.

Not done: Codex Potential/Hearing Candidate approval workflow and its separate Governance-disclosure consent; integration with `RESPONSIBILITY_EVIDENCE_MODEL.md` §6; "Next Recommended Steps" generation logic; remaining Identity view; Community Participation/Systems views; application types for which no implemented source exists; six unratified Community Systems items (each needs its own future ADR); Civic Contribution Framework integration (blocked on a framework that doesn't exist yet).

## Open work

See `OPEN_WORK.md` OPEN-004 for the full itemization and blockers.

## Do not redo

Do not re-derive the tri-tier visibility model or the "not a governance interface" architectural rule — both are settled, binding, and stated four times in the canonical spec. Do not re-invent Membership Lifecycle states (`REGISTERED → VERIFIED → ACTIVE → INACTIVE/PAUSED/SELF-ISOLATED/WITHDRAWN/RETIRED/SUSPENDED/TERMINATED`, never "Deleted") — this is owned by the Membership module (`MODULES/membership.md`), only displayed here.

## Evidence index

- `architecture/adr/ADR-034-member-profile-visibility-and-self-service-authorization.md`
- `docs/source/projects/MEMBER_PROFILE.md` (full read, prior session)
- `src/app/[locale]/profile/page.tsx`, `src/app/api/membership/{profile,create}/route.ts`, `src/i18n/member-profile.ts`, `src/application/member-profile.ts`
- commits `3a75efd`, `a31afef`
- tests: `route.test.ts`, `member-profile.integration.test.ts`, `MemberProfileDashboard.test.ts`
