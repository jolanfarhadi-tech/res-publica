# Software Supply Chain Security Policy

Status: Implemented engineering control; organizational approval and named
ownership remain required.

## Boundary

This policy covers npm dependencies and transitive packages, GitHub Actions,
Next.js/build tooling, Vercel deployment tooling, Auth0/PostgreSQL clients,
cryptographic libraries, browser code and any future external script, SDK,
container image or CDN resource. It introduces no authority to deploy, rotate a
secret or activate a provider.

## Dependency intake

Every new or upgraded dependency must pass, in order:

1. necessity review against existing repository capability;
2. maintainer/source and package-identity review;
3. licence compatibility review;
4. advisory and malware/package-risk review;
5. transitive graph and install-script review;
6. lockfile source, integrity and churn review;
7. focused and full tests, build and security scans.

Lockfile changes are security-sensitive. Reviewers must account for new
packages, registry/source changes, integrity changes, dependency-graph growth
and lifecycle scripts. `scripts/check-supply-chain.mjs` enforces the reviewed
registry and install-script allowlist; CI fails when either drifts.

## CI and source identity

All GitHub Actions are pinned to immutable commit SHAs. Workflow permissions
default to `contents: read`; the CodeQL job alone receives the bounded
`security-events: write` permission needed to publish analysis. Checkout does
not persist credentials. CI verifies its checkout equals `GITHUB_SHA`, scans
the active tree and Git history for high-confidence secret patterns, validates
the supply-chain policy, audits Production dependencies, runs authorization and
application tests, validates migrations, and builds the exact source revision.

Provider-backed artifact attestation is not claimed. Enabling GitHub/Vercel
provenance or protected-environment enforcement requires verification of the
private repository's plan, settings and owner-approved deployment policy.

## Runtime and package scripts

Node is pinned to the locally and build-verified `24.18.0` patch in `.nvmrc`
and CI; `package.json`/`package-lock.json` constrain deployment to the supported
`24.x` runtime line so security patch updates remain possible. Allowed
install-script packages are limited to the exact lockfile entries documented in the executable policy.

Vite 8's module transform moved CRLF-file shebangs behind generated export
statements when those executable `.mjs` modules were imported by tests. The
non-functional shebangs were removed from that import graph; scripts continue
to run through explicit `node scripts/...` commands. The canonical Vitest
runner remains enabled and no suite is skipped. Any runner or executable-entry
change fails CI until deliberately reviewed and updated.

## Secret handling

`scripts/check-secret-leaks.mjs` reports rule and path only, never the matched
value. A finding blocks release and requires evidence preservation, revocation
or rotation, verification that the old credential fails, dependent-service
updates and incident recording. The local scanner is a high-confidence gate,
not a substitute for GitHub secret scanning or provider-side detection.

## Compromise response

Follow `docs/operations/DEPENDENCY_COMPROMISE_PLAYBOOK.md`. Do not deploy from
an untrusted build, silently accept lockfile churn, expose secrets to untrusted
pull-request code or grant a workflow general write authority.

## External controls still required

- protected `main` and required-review/check configuration;
- named supply-chain and Tier-0 owners;
- provider-side secret scanning and security-alert routing;
- verified Production deployment protection and provenance/attestation where
  supported;
- periodic review of pinned Action SHAs and allowed install scripts.

## References

`docs/security/TIER_0_CONTROL_PLANE.md`;
`docs/operations/DEPENDENCY_COMPROMISE_PLAYBOOK.md`;
`scripts/check-supply-chain.mjs`; `scripts/check-secret-leaks.mjs`;
`.github/workflows/ci.yml`; `.github/workflows/codeql.yml`
