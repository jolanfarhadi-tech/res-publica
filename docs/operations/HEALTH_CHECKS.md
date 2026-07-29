# Operational health checks

## Status

Implementation baseline for M6 preparation, 2026-07-19. This does not activate
production deployment, monitoring, real personal-data processing, or the
legally blocked GDPR erasure path.

## Endpoints

- `GET /api/health/live` returns `200` when the Next.js process can serve a
  request. It deliberately checks no external dependency.
- `GET /api/health/ready` returns `200` only when PostgreSQL is configured and
  answers a minimal query. Missing configuration or a failed query returns
  `503` without exposing credentials, hostnames, SQL errors, or provider data.

Both responses use `Cache-Control: no-store`. Authentication provider outages
do not make the public site unready: ADR-027 requires anonymous Tier 1 content
to remain available while login and protected writes fail closed.

## Automated monitor

`.github/workflows/production-health.yml` runs the repository's
`scripts/check-deployment-health.mjs` every fifteen minutes and on manual
dispatch. It requires HTTPS and verifies the `200` status, expected minimal
JSON status, and `no-store` contract for both endpoints. It logs only endpoint
paths and HTTP status codes. GitHub workflow failure notification ownership
must still be assigned before launch.

## Intended use

The deployment platform may use liveness to detect an unresponsive process and
readiness to decide whether stateful traffic should reach an instance. Alerting,
retention, escalation recipients, and an external monitoring vendor remain
operational decisions and are not selected by these endpoints.

## Release boundary

Production activation still requires verified EU-resident PostgreSQL
configuration and migrations, an evidenced non-Production restore drill,
assigned incident ownership, security review, and the legal/data-protection
approvals stated in ADR-027 and M1 persistence guidance.
