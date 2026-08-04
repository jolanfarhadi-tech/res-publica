# Internal Security Review — BBS Research Wallet

**Status:** ENGINEERING REVIEW COMPLETE; INDEPENDENT REVIEW REQUIRED.

## Scope and result

Reviewed local custody, BBS issuance/derivation, holder proof, issuer/verifier
separation, replay/duplicate prevention, recovery, rotation, revocation,
redaction, persistence and gates. Synthetic tests execute real cryptography.
After upgrading `@digitalbazaar/vc` to 7.3.x, the Production dependency audit
reports zero known vulnerabilities.

## Corrected findings

1. Preserved Base64url thumbprint case.
2. Persisted and verified issuer challenge audience binding.
3. Replaced exact expiry timing with quarter-hour credential buckets.
4. Replaced a trusted recovery boolean with a local recovery-key signature over
   a one-time MFA-protected challenge.
5. Removed an unrelated AuditLog migration caused by snapshot drift.
6. Replaced library-detail verifier errors with generic external errors.
7. Removed a vulnerable transitive `undici` runtime through the VC upgrade.

## Residual findings

- Independent BBS cryptographic and interoperability review is absent.
- Revocation prevents renewal but leaves at most one 15-minute credential bucket.
- Issuer/verifier traffic can correlate through shared infrastructure logs.
- IndexedDB inherits browser-profile and operating-system compromise risk.
- Statistical reidentification requires per-project analysis.

The code is suitable for external review and synthetic gated deployment. It is
not approved for real credentials or contributions. The final gate is
`RESEARCH_REAL_DATA_ACTIVATION_APPROVED`.
