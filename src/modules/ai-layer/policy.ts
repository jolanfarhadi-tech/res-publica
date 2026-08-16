import type { BusinessDomain } from "../../platform/domain";

export type AIInputClass = "public-content" | "event-scoped-public-content" | "untrusted-editorial-intake";
export type AIFallback = "keyword-search" | "human-review-only";

export type AIUseCasePolicy = {
  id: string;
  domain: BusinessDomain;
  useCaseId: string;
  inputClass: AIInputClass;
  fallback: AIFallback;
  outputStatus: "advisory" | "draft";
  humanReviewRequired: boolean;
  externalProviderPermitted: false;
};

const policies: readonly AIUseCasePolicy[] = [
  {
    id: "civic.grounded-search.v1",
    domain: "civic",
    useCaseId: "grounded-search",
    inputClass: "public-content",
    fallback: "keyword-search",
    outputStatus: "advisory",
    humanReviewRequired: false,
    externalProviderPermitted: false,
  },
  {
    id: "civic.events-scoped-qa.v1",
    domain: "civic",
    useCaseId: "events.scoped-qa",
    inputClass: "event-scoped-public-content",
    fallback: "keyword-search",
    outputStatus: "advisory",
    humanReviewRequired: false,
    externalProviderPermitted: false,
  },
  {
    id: "civic.publishing-draft-authoring.v1",
    domain: "civic",
    useCaseId: "publishing.draft-authoring",
    inputClass: "untrusted-editorial-intake",
    fallback: "human-review-only",
    outputStatus: "draft",
    humanReviewRequired: true,
    externalProviderPermitted: false,
  },
] as const;

export function resolveAIUseCasePolicy(domain: BusinessDomain, useCaseId: string): AIUseCasePolicy {
  const policy = policies.find((candidate) => candidate.domain === domain && candidate.useCaseId === useCaseId);
  if (!policy) throw new AIUseCaseNotApprovedError(domain, useCaseId);
  return policy;
}

export class AIUseCaseNotApprovedError extends Error {
  constructor(domain: BusinessDomain, useCaseId: string) {
    super(`AI use case is not approved: ${domain}:${useCaseId}`);
    this.name = "AIUseCaseNotApprovedError";
  }
}
