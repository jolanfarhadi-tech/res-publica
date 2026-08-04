# Recovery Notes — Membership and Research Migrations 0014–0018

## Scope

- 0014 adds applications, document acknowledgements, research readiness,
  project consent and project eligibility.
- 0015 adds backward-compatible OIDC registration intent.
- 0016 adds wallet offer, device metadata and activation evidence.
- 0017 adds public device keys, temporary issuance challenges and recovery events.
- 0018 adds a nullable recovery public key and one-time recovery challenges.
- `drizzle-research/0000` is a separate verifier chain with six tables in the
  `research_anonymous` schema and no identity/member/wallet foreign key.

All changes are additive. Nullable key columns preserve pre-existing offered or
legacy rows. No migration updates, deletes, reclassifies or backfills a person,
member, consent, session, grant or audit record.

## Pre-application checks

1. Verify TLS, migration journal and approved migration role.
2. Create and test a provider recovery point.
3. Record existing member/application row counts without exporting personal data.
4. Confirm new tables/columns are absent outside the journal.
5. Apply only the repository migration chain.
6. Apply the verifier chain only to its dedicated database/role.

## Verification

Run `db:check`, `db:check:fresh` and `db:check:research:fresh`; verify 19 main
migrations/66 tables and one verifier migration/six tables. Confirm `PUBLIC` has
no verifier schema/table privilege and existing membership identifiers/counts are
unchanged.

## Recovery and rollback

Prefer forward repair. On failure, stop only affected writes, preserve secret-free
evidence and restore the verified provider recovery point. Dropping new tables is
allowed only on empty development/test databases. Never drop them in Production
after an application, consent, eligibility, wallet or contribution exists.

Production application is not authorized by this document.
