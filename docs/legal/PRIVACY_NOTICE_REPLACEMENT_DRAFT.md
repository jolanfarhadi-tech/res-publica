# Privacy notice replacement — legal-review draft

**Not approved for publication. Not legal advice.**

This draft corrects technical inaccuracies in the current public notice. The
controller, counsel or data-protection owner must approve legal bases,
retention periods, processor transfer language, rights handling, and contact
details before replacing `datenschutz.md`.

## Verified technical scope to disclose

- **Public website and hosting:** Vercel serves the site and necessarily
  processes request/network metadata and operational logs according to the
  contracted service settings.
- **Authentication:** Auth0 is the OIDC identity provider. The application
  processes issuer/subject identifiers, authentication assurance, session
  identifiers, timestamps, expiry, PKCE flow state, and the minimum verified
  claims used to link an identity. The application uses an encrypted,
  HTTP-only session cookie.
- **Database:** Neon-hosted PostgreSQL stores canonical application records.
  Verified EU residency and the contracted region, subprocessor list, backup
  coverage, and transfer terms must be attached to the approved notice.
- **Membership/profile:** when an authenticated person applies, the platform
  stores Person and Member references, membership type/status, account locale,
  and exactly two separately granted, versioned consent records with grant
  timestamp and revocation state. The board retains the constitutional
  admission decision; the platform does not make it automatically.
- **Events:** authenticated registration stores event, person, status
  (confirmed, waitlisted, or cancelled), registration time, waitlist position,
  notifications, and canonical audit evidence.
- **Authorization and accountability:** identity links, sessions, scoped
  capability grants, publication/governance workflow records, and append-only
  AuditLog entries support bounded authority, separation of duties, and
  accountability.
- **Security:** pseudonymized rate-limit buckets contain a scope-separated
  HMAC of network identifiers, counts, windows, and expiry. Structured
  application failure logs contain a request ID, timestamp, method, and path,
  not exception payloads, tokens, or profile contents.
- **Preferences:** necessary preferences and optional interface settings are
  managed in the browser. Analytics is disabled by default and no analytics
  provider is approved or activated.
- **Contact:** the current contact action opens the visitor's email client;
  Res Publica then processes the message in its mail service. No website
  contact-form database submission is represented as operational.
- **Publishing Authority:** authorized internal users may create and review
  multilingual publication versions. The system records assignments,
  decisions, provenance, and audit evidence and never auto-publishes.

## Required legal determinations before publication

1. Confirm the controller representation and privacy contact.
2. Assign a legal basis to each activity in the processing inventory; do not
   assume consent is the basis for every membership operation.
3. Approve concrete retention/erasure rules, including Auth0, Vercel and Neon
   logs, sessions, unsuccessful OIDC flows, rate-limit buckets, consent
   evidence, event records, notifications, and AuditLog.
4. Explain withdrawal effects separately from statutory or contractual
   retention. The current application cannot offer consent withdrawal until
   the reserved ADR-035/legal gate is accepted.
5. Approve the handling of access, correction, restriction, objection,
   portability, withdrawal, and erasure requests.
6. Verify Vercel, Neon, Auth0, and any email provider DPAs, subprocessors,
   transfer mechanisms, and EU residency statements.
7. State cookie/storage details from the deployed configuration, including
   the session cookie and browser preference storage.
8. Confirm supervisory-authority and complaint information.

## Claims that must be removed from the current notice

The current statement that no user profiles are created is no longer
technically accurate. The approved replacement must distinguish private
membership/profile records from prohibited public profiles and must describe
authentication, consent, event, authorization, audit, and processor activity.
