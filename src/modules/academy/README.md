# Academy module

The Academy is a Civic-domain learning capability. It implements the
repository's approved Academy/RPCS direction without publishing invented
courses, instructors, accreditation or completion claims.

## Boundaries

- `Person`, `Notification` and `AuditLog` remain canonical shared entities.
- Programme and course presentation are distinct from enrollment, progress,
  assessment and staff authority.
- Course and programme publication follows
  `draft -> review -> approved -> published -> archived`.
- Editors cannot approve their own course, approvers cannot publish it, and
  learners cannot review their own assessment or issue their own completion
  record.
- Staff writes require exact-scope Civic capabilities, MFA, the shared request
  security boundary, the shared PostgreSQL rate limiter and atomic canonical
  audit evidence.
- Learner writes are disabled unless `ACADEMY_ENROLLMENT_ENABLED=true`.
- Public certificate verification is intentionally person-free and makes no
  state, external or professional accreditation claim.
- All published content requires DE, EN and FA records plus source references;
  there is no silent locale fallback.

## Canonical source basis

- `brain/APPLICATION/APPLICATION_ARCHITECTURE.md`
- `brain/DOMAIN/CORE_DOMAIN_MODEL.md`
- `brain/MODULE_INDEX.md`
- `docs/source/academy/`
- accepted ADR-002, ADR-003, ADR-026, ADR-027 and ADR-029
