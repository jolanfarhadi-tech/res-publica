/** ADR-033 placeholder only. No DID resolution, verification, persistence, or authorization mapping. */
export interface GovernanceIdentityEvidence {
  readonly subject: string;
  readonly issuer: string;
  readonly verifiedAt: Date;
  readonly credentialReferences: readonly string[];
}

export interface GovernanceIdentityEvidenceProvider {
  readonly providerName: string;
  resolveEvidence(subject: string): Promise<GovernanceIdentityEvidence | null>;
}
