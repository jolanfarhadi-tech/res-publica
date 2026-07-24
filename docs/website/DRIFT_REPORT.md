# Website Drift Report

**Date:** 2026-07-24

**Release candidate:** frontend working tree based on `09c160bb7e56a7bd9e5b9039e2f12de49ae727bf`

## Result

No blocker or major content drift was found.

## Checks

- **Terminology and zero gamification:** no public reputation, leaderboard, rank, points, score, or competitive badge mechanic is present. Search scoring terms are private implementation details; maturity labels describe offerings, not people.
- **Claims and figures:** the transformed narrative introduces no impact figures, partnerships, testimonials, completed capabilities, or institutional history beyond the verified source material.
- **Provenance:** public collection indexes continue to use the publication/provenance gate; unsupported records are not promoted as verified public work.
- **Identity:** placeholder team members and partners are suppressed rather than presented as real people or organizations.
- **Language equivalence:** the WHY / HOW / WHAT / JOIN narrative, Method, Offerings, Membership boundary, and trust safeguards are represented in DE, EN, and FA.
- **Public boundaries:** the website does not issue Publishing Authority write requests. Publishing Authority is described only as a protected human-accountability layer.
- **Operational honesty:** Contact does not simulate delivery, and future/non-operational offerings do not expose operational calls to action.
- **Legal continuity:** existing legal routes and content remain unchanged by the narrative transformation.

## Minor observations

- `SearchClient.tsx` uses internal `score`, `points`, and `Ranking` terminology for local text-result ordering. These terms are not rendered as civic status, trust, or member comparison.
- The newsletter remains provider-dependent and must continue to show its unavailable state when production provider configuration is absent.

## Follow-up

- Re-run this check after any substantial public-content, offering-maturity, identity, partnership, or translation update.
