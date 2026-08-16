# Application Resource-Exhaustion Controls

Status: Mandatory hardening Phase D repository boundary

## Rate-policy classes

The application does not use one global threshold. All dynamic limits use the
shared distributed PostgreSQL bucket with a scope-separated HMAC client key;
raw addresses are not stored.

| Class | Implemented policy | Additional bound |
|---|---|---|
| Public static content | CDN/static generation; no application bucket | no database query for static pages |
| Public Knowledge Graph / API | 120 requests / 15 minutes per distinct scope | query/cursor length and page size 1–100 |
| Login | 10 / 15 minutes | OIDC PKCE/state/nonce; callback consumes one-time state |
| Membership application | 5 / hour | declared JSON body 32 KiB; bounded fields/arrays |
| Membership profile | 120 / 15 minutes | self-only projection |
| Fellowship application | 10 / hour | declared body 256 KiB; bounded evidence arrays/text |
| Academy self-service | 30 / 15 minutes | declared body 128 KiB; bounded responses |
| Academy certificate verification | 120 / 15 minutes | fixed 32-character verification identifier |
| AI/RAG | 30 / 15 minutes | declared body 8 KiB; query 4,000 chars; local provider cost zero |
| Operations/private workspaces | 60 / 15 minutes per distinct read scope | result limits 1–100; exact authorization/MFA |
| Governance/Publishing | 60 / 15 minutes per distinct write scope | declared body 256 KiB; exact authorization/MFA |
| Academy privileged writes | 60 / 15 minutes | declared body 2 MiB for bounded curriculum payloads |
| Fellowship privileged writes | 60 / 15 minutes | declared body 256 KiB |
| Knowledge Graph writes | 30 / 15 minutes | declared body 256 KiB; no recursive public query API |
| Research wallet/recovery | 5–20 per 15–60 minutes by operation | 32–64 KiB declared bodies; real-data gate fail closed |
| Newsletter | 5 / hour | declared body 8 KiB; provider disabled by default |

## Resource-amplification findings

- Dashboard, Member Profile, Integrated Operations and Publishing Workspace
  projections issue multiple bounded database reads. They now consume distinct
  distributed limits before actor resolution and projection work.
- Public Academy certificate verification was an unmetered database lookup. It
  now has its own public verification scope.
- Sensitive JSON write policies now reject an over-budget declared
  `Content-Length` with a no-store `413` before database rate-limit work.
- Public API pagination is cursor-based and capped at 100. Operations and
  Publishing projections cap results at 100. AI input is capped at 4,000
  characters and cannot call a paid/external provider in the implemented mode.
- No file-upload, generic recursive query, public graph traversal, external AI,
  analytics or object-processing endpoint is active.

## Limitations

The application-level body guard can validate a declared `Content-Length`; it
does not replace Vercel's request-body/stream limits for requests whose transfer
length is unavailable. Promise timeouts do not safely cancel PostgreSQL
transactions and are therefore not presented as execution cancellation.
Provider DDoS mitigation, Firewall/WAF rules, bot challenges, Attack Mode,
security-log export and alert routing require direct Vercel evidence and remain
external gates.

## Graceful degradation

Phase-C controls permit optional capability/write-scope quarantine while public
static pages remain available: AI may be disabled independently, Fellowship or
Publishing writes may be frozen without removing public information, and the
Research override closes wallet/real-data flows without disabling Membership.
These modes do not authorize autonomous threshold changes or WAF actions.

