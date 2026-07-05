# Build

## Purpose
Describes how Res Publica's technical products (the Website, and eventually the HARM platform) are actually built and deployed.

## Background
Partially confirmed from the Website project's own build workflow (Next.js 15, Vercel, GitHub Actions CI, WEB-* skill commands) and the organization's existing CLI Architecture reference.

## Core Principles
Architecture before code (WEB-00 through WEB-02 produce only documents, per confirmed Website workflow); human approval gates before production deployment.

## Definitions
Build, for the Website, follows the WEB-* skill sequence in `WEBSITE.md`. Build, for the broader HARM platform, is not yet specified beyond the organization's general CLI Architecture reference.

## Framework
Website: Next.js 15, TypeScript, Tailwind v4, Vercel, GitHub Actions. Platform: not yet specified in available source material.

**Version 1.0 proposal — HARM platform build sequence, pending approval:** following the same Foundation Build Order discipline already used for the broader ecosystem (Core Domain Model and Application Architecture first, per `../foundation/06_ECOSYSTEM.md`), a proposed platform build order is: (1) AHIP intake tool, (2) Structured Hearing scheduling and documentation, (3) Responsibility Evidence recording and verification, (4) Harm Codex taxonomy storage, (5) Civic Intelligence reporting. This sequence is proposed, not approved — it requires its own architecture and ADR process before implementation, consistent with `../foundation/04_GOVERNANCE.md`.

## Workflow
See `WEBSITE.md` §Workflow for the confirmed Website build sequence.

## Roles
Claude Code executes; Human Approval Authority gates production deployment.

## Inputs
Approved source documents and design tokens.

## Outputs
A deployed, reviewed build.

## Governance
No production deployment without explicit human approval (confirmed rule, `WEBSITE.md`).

## AI Integration
Claude Code performs the build; it does not deploy to production unilaterally.

## Examples
See `.claude/skills/web-09-deploy/SKILL.md`.

## References
`WEBSITE.md`; `.claude/skills/web-09-deploy/SKILL.md`

## Related Documents
`WEBSITE.md` · `../foundation/06_ECOSYSTEM.md`
