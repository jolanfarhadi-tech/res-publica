# Website

## Purpose
Describes Res Publica's official public website — a communications and recruitment surface, explicitly *not* the HARM platform itself.

## Background
Fully confirmed from the extracted project instructions (repo-root `WEBSITE.md`, originating from `res-publica-claude-code-v2.zip`).

## Core Principles
Zero Gamification (no scores/rankings/badges for people; "Trust," never "Reputation"); approved sources only, nothing invented; trilingual mandatory (de/en/fa, fa = RTL); trauma-informed language; GDPR-first; architecture before code; human approval gates for legal text, public figures, and production deploys; stop after every WEB-command.

## Definitions
The website is a Next.js 15 (App Router, TypeScript) application, trilingual, deployed on Vercel. It holds no Codex data access, no Hearings online, and processes no participant data beyond application/contact forms.

## Framework
Approved source documents: `docs/source/core/` (Constitution, HARM Operating System, Ethics Charter, Vision, Mission) and `docs/source/projects/` (Project Proposal, RPCS Program, Lab Series Fellowship, Early Warning Proposal, exhibition and outreach material); `docs/source/legal/` (read-only, never copied to the site).

## Workflow
11 skills as slash commands: `web-00-scope → web-01-sitemap → web-02-content-model → {web-03-design-system → web-04-i18n → web-05-core-pages → web-08-seo-a11y → web-09-deploy} / {web-06-legal → web-07-forms}`, with `web-10-drift-check` recurring after `web-05`.

## Roles
Claude Code executes each WEB-command; Jolan (the organization's principal) approves legal text, public figures, and production deployments; Claude never deploys unilaterally.

## Inputs
The approved source documents listed above.

## Outputs
The public website: home, mission, method (HARM/AHIP/Structured Hearings, lay-accessible), labs (5 Innovations), fellowship, civic school (RPCS), codex (explanation only), culture/exhibition pages.

## Governance
Every WEB-command stops after completion; drift-checks compare output against source documents, reporting deviations rather than silently correcting them.

## AI Integration
Claude Code builds documents and code per WEB-command; it never publishes legal text or public figures without explicit prior human approval.

## Examples
See the 11 skill files in `.claude/skills/web-*` for the concrete, executable form of this workflow.

## References
Repo-root `WEBSITE.md`; `.claude/skills/web-*/SKILL.md`

## Related Documents
`../foundation/01_HARM_OPERATING_SYSTEM.md` · `PROJECT_PROPOSAL.md` · `../standards/BRAND_GUIDE.md`
