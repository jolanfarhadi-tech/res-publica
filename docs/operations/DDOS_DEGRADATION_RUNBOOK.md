# DDoS and Resource-Exhaustion Degradation Runbook

Status: Repository procedure; edge/provider action requires authorized operator

## Detect and classify

1. Confirm request IDs, routes, status distribution, latency and rate-limit
   scopes without exporting request bodies, cookies, identities or raw IPs.
2. Distinguish volumetric edge traffic from application-layer amplification:
   repeated expensive reads, oversized bodies, enumeration, graph/search/RAG
   repetition, certificate verification or credential issuance.
3. Confirm database health and avoid treating an unavailable limiter store as
   permission to fail open.

## Narrow response

- Keep static public information available wherever safe.
- For one affected authenticated capability, use the exact Phase-C capability
  quarantine.
- For one protected write class, freeze only its existing write scope.
- For any Research invariant failure, force Research fail closed.
- Use Vercel Firewall/WAF, bot challenge or Attack Mode only after an authorized
  operator confirms the feature and rule behavior in the canonical project.

Do not globally lower limits, block a locale, disable health/readiness, weaken
authentication, or turn off immutable audit as an emergency shortcut.

## Verification

Verify the attacked endpoint returns correlated 429/413/503 responses as
appropriate, no rejected request reaches domain persistence, and unrelated DE,
EN and FA public routes remain healthy. Check database bucket growth and expiry
index behavior. Record provider rule IDs and timestamps outside source control;
never record credentials or raw client addresses.

## Recovery

Remove a temporary quarantine or edge rule only with independent review and
evidence that the cause is remediated. Re-run focused abuse tests, health,
readiness, private-boundary checks and the complete verification suite. A
provider setting is not considered verified merely because this runbook exists.

