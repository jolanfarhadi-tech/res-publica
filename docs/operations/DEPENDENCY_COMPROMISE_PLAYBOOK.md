# Dependency and Build-Pipeline Compromise Playbook

Status: Executable runbook; destructive Production actions and credential
rotation require the existing authorized operators and approvals.

## Trigger

Use for a compromised package or maintainer, malicious release, compromised
GitHub Action, lockfile/source anomaly, secret-scan finding or untrusted build
artifact.

## Sequence

1. Stop further deployment without deleting evidence.
2. Record incident/request ID, reporter, time, affected package/Action, source
   commit, build and deployed revision where known.
3. Preserve workflow logs, lockfile, package metadata, deployment metadata and
   relevant provider events without copying secret values.
4. Determine affected commits, builds, environments, credentials and runtime
   capabilities. Keep observation separate from inference.
5. Quarantine only the affected capability where an existing kill switch is
   available; keep unrelated public services healthy.
6. Revoke/rotate only credentials proven or reasonably believed exposed,
   using the dependency-aware owner/consumer procedure. Verify old credentials
   fail and dependent services recover.
7. Pin, remove or replace the dependency/Action. Review all transitive and
   lockfile changes; rebuild from a verified source revision.
8. Run secret scan, supply-chain gate, dependency audit, tests, authorization
   tests, migration checks and Production build.
9. Deploy only through the approved process and verify source commit equals the
   deployed revision.
10. Heighten monitoring, record residual uncertainty and conduct a human
    post-incident review before unfreezing the affected capability.

## Do not

- do not force-push or erase compromised history;
- do not execute package-supplied remediation scripts without review;
- do not expose a found secret in chat, logs or tickets;
- do not restore the latest build merely because it is latest;
- do not widen workflow permissions to make a security check pass;
- do not scan, access or retaliate against attacker-controlled infrastructure.

## Verification record

Record expected effect, actual effect, evidence reference, source/deployment
SHA, credential-rotation verification (without values), rollback state and
remaining approval boundary.

## References

`docs/security/SOFTWARE_SUPPLY_CHAIN_POLICY.md`;
`docs/security/TIER_0_CONTROL_PLANE.md`;
`docs/operations/INCIDENT_RESPONSE_RUNBOOK.md`;
`docs/operations/NEON_BACKUP_RESTORE_RUNBOOK.md`
