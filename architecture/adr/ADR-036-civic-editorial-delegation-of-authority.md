# ADR-036: Civic Editorial Delegation of Authority

## Status

Accepted — explicitly approved by the Founder on 2026-07-19.

## Authorship

Prepared on 2026-07-19 at the Founder's explicit instruction to define the
Civic editorial roles, powers, limits, session actor, and no-auto-publish
boundary before operationalizing the Publishing backend. This is a proposal,
not an accepted institutional decision, and it authorizes no code.

## Classification

Civic Domain authorization and accountability decision. This ADR specializes
the shared authentication and deny-by-default authorization mechanism accepted
in `ADR-027` for the Publishing workflow. It does not amend the Constitution,
delegate Founder authority, select an identity provider, authorize autonomous
AI publishing, or change the Git publication approval boundary.

## Context

- `ADR-026` assigns civic products and their business policy to the Civic
  Domain while Shared Platform Services owns reusable mechanisms.
- `ADR-027` requires explicit, persisted, audited domain grants; MFA for staff;
  a session-derived actor; and denial when a grant is absent, expired, or
  revoked.
- `ADR-029` requires an institutional state transition and its canonical
  `AuditLog` append to commit atomically through the shared transaction
  boundary.
- The Publishing module already models intake, moderation, AI-assisted draft
  authoring, translation handoff, human sign-off, and publish readiness, but it
  has no persistence or protected API.
- The existing module deliberately never writes a public content file and
  never invokes Git. A named human approves a draft, and an actual publication
  commit remains a separate explicitly authorized action.
- Operationalizing this backend requires role semantics before protected
  endpoints are exposed.

## Proposed Decision

### 1. Editorial authority is explicit, scoped, and deny-by-default

An editorial role is a persisted, auditable Civic Domain delegation to one
canonical `Person.id`. Every grant identifies the role, publication or
collection scope, grantor, grant time, and optional expiry. Absence, expiry,
revocation, wrong scope, or insufficient assurance means denial.

A role name supplied by a request, UI state, identity-provider claim, or AI
output grants no authority. Roles are capabilities, not ranks, credentials,
reputation signals, or measures of contribution. Holding more than one role
creates no implicit permission beyond the independently satisfied grants.

Founder approval, ADR acceptance, legal approval, production release approval,
and authorization of a real Git commit remain outside this role model.

### 2. Four editorial roles and their boundaries

| Role | Permitted powers | Explicit exclusions |
|---|---|---|
| Editor | Register editorial intake; edit and version a draft; request a citation-grounded AI draft where the accepted AI policy permits; create translation handoffs; submit a draft to moderation | Cannot approve or reject their own submission or draft; cannot finalize a translation merely by assigning it; cannot sign off, mark ready, write public files, invoke Git, or publish |
| Reviewer | Accept or reject an assigned moderation item with a recorded reason; return a draft for revision; verify that required citations and editorial checks are present | Cannot review a submission or draft they authored; cannot silently rewrite the reviewed artifact; cannot finalize translations, sign off, mark ready, or publish |
| Translator | Work only on an assigned locale handoff; revise an AI-assisted or human starting draft; record the human-finalized translation state | Cannot approve source-content accuracy outside the translation assignment; cannot moderate their own work, sign off, mark ready, or publish; an AI translation is never final without this human action |
| Publisher | Perform final human sign-off after moderation and required translation completion; verify the accountable publication scope; mark the signed-off draft ready for a separately authorized publication action | Cannot sign off a draft they authored, moderated, or translated; cannot bypass missing review or translation gates; cannot write files, invoke Git, create a commit, deploy, or auto-publish through this role |

The same person may hold multiple grants for operational resilience, but
separation-of-duty rules are evaluated from artifact history, not merely role
names. A person who acted as Editor, Reviewer, or Translator on an artifact
cannot act as its Publisher, even if they hold the Publisher role.

### 3. Granting, expiry, revocation, and suspension

1. The Founder/Human Approval Authority appoints and removes Publishers
   through an explicit recorded process outside the Publishing API.
2. An active Publisher may grant, time-limit, and revoke Editor, Reviewer, and
   Translator roles only within the Publisher's own publication scope.
3. Self-granting is prohibited; grantor and grantee must be different people.
4. A Publisher cannot grant or revoke the Publisher role and cannot create any
   Founder, constitutional, legal, release, or Git-commit authority.
5. Identity-provider groups or future credentials may be considered as
   evidence by the human grantor but never create a role automatically.
6. Revocation applies to the next protected operation. Active sessions do not
   preserve revoked authority because grants are revalidated per request.
7. Expired, revoked, and suspended grants remain immutable history; they are
   not deleted or rewritten.
8. Every grant, revocation, expiry-relevant change, and suspension is recorded
   with the session actor in the canonical `AuditLog`.

### 4. The accountable actor always comes from the verified session

Every protected editorial operation resolves its actor from a locally
verifiable, unexpired, non-revoked application session. Request bodies, query
parameters, route parameters, headers, AI output, or imported document
metadata cannot choose or replace the accountable actor.

Editor, Reviewer, Translator, and Publisher operations require staff-level MFA
under `ADR-027`. State-changing browser requests additionally enforce the
accepted trusted-origin/CSRF boundary. Missing session, missing MFA, missing or
revoked grant, wrong publication scope, or separation-of-duty conflict fails
closed without changing editorial state.

### 5. Editorial workflow gates remain ordered and human-controlled

The protected workflow is:

`intake → editing/versioning → assigned moderation → translation handoff where required → human-finalized translation → Publisher sign-off → ready`

Rejection returns the artifact to an explicitly recorded non-publishable state
and cannot be converted to approval by an Editor or automation. Sign-off
requires the exact signed draft version; subsequent edits invalidate that
sign-off and require review and sign-off of the new version.

Every assignment and decision records its human actor, time, target version,
scope, and reason where applicable. No endpoint accepts a preconstructed
decision record that attributes an action to another person.

### 6. AI may assist drafting but receives no editorial authority

The Publishing workflow may call the accepted shared AI Layer only for
citation-grounded draft or translation assistance and only where its runtime
and policy gates permit. AI output is always a draft, retains citations and
weak-citation flags, and cannot assign roles, moderate, finalize a translation,
sign off, mark ready, publish, or represent an official Res Publica position.

No AI result advances the workflow without the named human action required for
that transition. Failure or unavailability of the AI Layer leaves human
editing and review available and never weakens an authorization or publication
gate.

### 7. Publish readiness is not publication

Publisher sign-off may create a persisted `ready` record only. The Publishing
backend must not write or modify MDX/content files, run Git, create or amend a
commit, push a branch, trigger a deployment, or call an API that performs any
of those actions.

Actual file creation, Git commit, push, and deployment remain separate actions
subject to their existing explicit human approval boundaries. A `ready` record
is evidence that editorial review completed; it is not authorization to cross
any repository or production boundary and cannot be consumed by an unattended
auto-publish worker.

### 8. Editorial state and audit evidence are atomic and append-only

Intake creation, assignments, moderation decisions, translation finalization,
sign-off, publish-readiness, grants, and revocations append canonical
`AuditLog` evidence in the same database transaction as the corresponding
state change. No parallel editorial audit log is created.

Audit entries and historical editorial decisions are append-only. Corrections
create a new version or superseding decision and never rewrite the historical
record. Transaction failure rolls back both editorial state and its audit
append. This ADR creates no exception to the database immutability boundary
accepted in `ADR-029` and operationalized under `ADR-033`.

## Alternatives Considered

### One Editor role performs the entire workflow

Rejected. Authorship, moderation, translation finalization, and official
sign-off are distinct accountable acts; collapsing them would make human
approval nominal rather than independently verifiable.

### Let identity-provider groups grant editorial authority automatically

Rejected. External claims do not carry publication scope, separation-of-duty
history, appointment evidence, or application revocation semantics.

### Permit Publisher to perform the Git commit automatically

Rejected. Editorial readiness and repository mutation are different approval
boundaries. Combining them would turn sign-off into auto-publication and allow
an application defect or compromised session to alter the public record.

### Allow AI to approve low-risk content

Rejected. Risk classification cannot remove named-human accountability, and
an AI-authored official position would violate the accepted publishing trust
model.

## Consequences

- Publishing persistence and protected APIs may be implemented only after
  Founder acceptance of this ADR.
- Every protected action is attributable to one verified session actor with a
  scoped Civic Domain grant.
- Editorial duties remain separated per artifact even when a small team member
  holds multiple roles.
- Translation and AI assistance cannot bypass human finalization and sign-off.
- Publisher authority ends at `ready`; public file, Git, push, deployment, and
  production actions remain separately approved.
- Historical grants, decisions, versions, and audit evidence remain traceable
  without becoming scores or staff-performance metrics.

## Validation Criteria

- All protected editorial operations fail without a valid MFA session and the
  exact active, scoped role grant.
- Request data cannot choose the accountable actor, grantor, reviewer,
  translator, or approver in place of the session actor.
- Self-grant, Publisher-grant, cross-scope grant, expired grant, and revoked
  grant attempts are rejected.
- An Editor cannot review or publish their own artifact; a Reviewer or
  Translator cannot sign off the artifact they handled.
- A moderation decision identifies the assigned human Reviewer and target
  version.
- An AI translation cannot reach `human-finalized` without a Translator's
  recorded session action.
- Editing a signed-off draft invalidates readiness and requires a new review
  and sign-off chain.
- No application path writes content files, invokes Git, pushes, deploys, or
  auto-publishes.
- Each editorial transition and audit append commits atomically; rollback
  leaves neither record behind.

## Human Approval Required

Founder approval is required for all proposed decisions before implementation,
specifically:

1. explicit, scoped, deny-by-default Civic editorial grants;
2. the Editor, Reviewer, Translator, and Publisher powers and exclusions;
3. Founder-only Publisher appointment and Publisher delegation of operational
   roles, with no self-grant or Publisher-grant;
4. session-derived actors, staff MFA, per-request grant revalidation, and
   fail-closed protected operations;
5. ordered workflow gates, artifact-version binding, and separation of duties;
6. AI assistance as draft-only with no editorial authority;
7. Publisher authority ending at `ready`, with no file, Git, push, deployment,
   or auto-publish capability; and
8. atomic state-plus-audit transactions with append-only history.

## Human Approval Record

The Founder accepted all eight proposed decisions on 2026-07-19 with the
explicit instruction: “ADR-036 mit den acht vorgeschlagenen Entscheidungen zum
Civic-Redaktionsrollenmodell als Founder-Entscheidung akzeptiert. Status darf
auf Accepted gesetzt, DECISIONS.md aktualisiert und die Backend-Implementierung
des Publishing-Moduls begonnen werden — analog zum Vorgehen bei ADR-033 und
ADR-034: erst ADR committen, dann Implementierung, dann erneute Freigabe vor
jedem Commit.” Implementation is authorized only within the boundaries
recorded in this ADR; every implementation commit still requires renewed human
approval.

## References

`architecture/adr/ADR-002-domain-model.md`;
`architecture/adr/ADR-026-constitutional-domain-architecture.md`;
`architecture/adr/ADR-027-identity-authentication-authorization.md`;
`architecture/adr/ADR-029-audit-and-event-bus-boundary.md`;
`architecture/adr/ADR-030-ai-runtime-boundary.md`;
`architecture/adr/ADR-033-delegation-of-authority.md`;
`brain/00_constitution/00_constitution.md`;
`brain/BLUEPRINTS/mvp-module-blueprint.md`;
`src/modules/publishing/README.md`;
`src/modules/publishing/types.ts`;
`src/modules/publishing/intake.ts`;
`src/modules/publishing/moderation.ts`;
`src/modules/publishing/draft-authoring.ts`;
`src/modules/publishing/translation.ts`;
`src/modules/publishing/sign-off.ts`;
`src/modules/publishing/publish.ts`.
