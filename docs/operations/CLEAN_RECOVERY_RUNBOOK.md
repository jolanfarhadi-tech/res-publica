# Clean Recovery Runbook

Status: Mandatory hardening Phase E repository procedure. A Production
cutover, destructive restore, credential rotation or provider change requires
the existing named human authority and cannot be authorized by this document.

## Safety boundary

Recovery is not simply restoration of the newest bytes. It must preserve
evidence, identify a defensible **LAST-KNOWN-GOOD** source and prove that the
restored system does not reproduce the compromise. Keep public static content
available where safe, but freeze affected writes and optional capabilities
before widening access.

## Clean recovery sequence

1. Contain the narrow affected capability and preserve request IDs, deployment
   SHA, provider configuration references, database recovery-point reference,
   incident timeline and hashes of retained evidence.
2. Determine affected source commits, dependencies, credentials, roles, data
   mutations, graph sources, RAG corpora and workflow configuration.
3. Select the last-known-good source commit and recovery point using observed
   evidence. Record contradictory evidence and uncertainty.
4. Prepare an isolated non-Production environment with separate temporary
   credentials. Never restore over Production for a drill.
5. Restore database, application source and configuration from independently
   verified inputs. Do not copy a suspected secret or mutable build artifact.
6. Validate the exact migration journal, table inventory, constraints,
   application startup, readiness and representative public routes.
7. Re-run server-side authorization tests: anonymous denial, self-only
   Membership, Fellowship isolation, private graph exclusion, auth-before-RAG,
   protected Operations, Governance and Publishing exact scope/MFA.
8. Verify revoked sessions, grants, wallets and credentials remain unusable.
   Keep `RESEARCH_REAL_DATA_ACTIVATION_APPROVED` closed unless its independent
   external gate is explicitly approved again.
9. Rotate only credentials proven or reasonably suspected to be exposed,
   following the dependency map and verifying old-secret failure plus every
   consumer before revoking recovery access.
10. Security-test the isolated result, compare it to the approved source SHA,
    obtain required human/dual approval and only then conduct a controlled
    return to service with heightened monitoring.

## Do not restore the attack

Reject a recovery candidate that contains an unauthorized role, active revoked
credential, malicious database mutation, poisoned or unapproved graph source,
private RAG disclosure, vulnerable dependency, untrusted workflow, compromised
secret or build artifact not traceable to the selected source commit.

## Repeatable synthetic drill

`npm run ops:recovery-drill:local` creates a fully migrated isolated PGlite
source, writes synthetic revoked access and audit state, produces an in-memory
compressed backup, restores it into a second isolated directory, validates the
26-migration/105-table identity and security state, then removes both temporary
directories. It never connects to Production and processes no real person.

The provider drill remains `npm run ops:restore-drill`. It requires a dedicated
isolated Neon branch and a secret `NEON_RESTORE_DRILL_DATABASE_URL`; its SQL
runs inside a read-only transaction. It also requires the non-secret
`NEON_PRODUCTION_DATABASE_HOST` and rejects that endpoint. Branch
creation/deletion, backup selection and any Production recovery are external
operator actions.

## Unapproved objectives

RPO, RTO, incident commander, recovery owner and destructive cutover authority
remain **OWNER DECISION REQUIRED**. Drill duration is evidence from one run,
not an approved service objective.
