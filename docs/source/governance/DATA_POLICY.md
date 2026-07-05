# Data Policy

## Purpose
States how personal and testimony data is collected, minimized, protected, and retained across the ecosystem.

## Background
Confirmed real policy references in project material: a DPIA (Data Protection Impact Assessment, `DPIA_v2.0.md`), an Ethics Protocol, and GDPR (DSGVO) compliance requirements. The actual DPIA/legal documents themselves are not present in this repository (they are referenced as read-only legal source documents in a separate project structure).

**Status: Version 1.0 summary**, reflecting confirmed policy commitments; the full legal DPIA content itself is out of scope for this documentation tree and remains the authoritative legal source once available.

## Core Principles
Data minimization; explicit informed consent (GDPR Art. 6(1)(a)/9(2)(a)); no tracking without opt-in; a clear right of withdrawal.

## Definitions
**Data minimization** means collecting only what is strictly necessary for the stated purpose — confirmed in practice by the RPCS application form containing exactly the fields necessary for evaluation, no more.

## Framework
Applies to every data-collecting touchpoint: RPCS applications, AHIP intake, Structured Hearing records, newsletter/contact forms.

## Workflow
1. Before any new data collection point is built, a data-minimization check confirms only necessary fields are included.
2. Explicit consent is captured at the point of collection.
3. Retention and deletion follow the pseudonymization-on-erasure pattern already established in the organization's domain model (`brain/DOMAIN/CORE_DOMAIN_MODEL.md`).

## Roles
**Institution** (Res Publica itself) — data controller. **Participant** — data subject, with full consent and withdrawal rights.

## Inputs
Any personal data collection request.

## Outputs
A GDPR-compliant, minimized data collection design.

## Governance
No public number, name, or partner detail is published without explicit human approval (already-confirmed rule from project material).

## AI Integration
AI systems do not access raw participant data beyond what their scoped, approved function requires.

## Examples
The RPCS application form's exact, minimal field set (`../academy/RPCS_PROGRAM.md` §Inputs) is the confirmed reference implementation of this policy.

## References
Project material referencing `DPIA_v2.0.md`, `ETHICS_PROTOCOL.md` (legal source documents, not present in this documentation tree); `brain/DOMAIN/CORE_DOMAIN_MODEL.md` (`ConsentRecord`)

## Related Documents
`ETHICS_CHARTER.md` · `../projects/COMMUNITY.md`
