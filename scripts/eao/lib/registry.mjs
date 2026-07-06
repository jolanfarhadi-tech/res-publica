// Shared EAO utility - the code-level Category Registry and Risk Domain
// Registry, implementing brain/AI/EAO_CATEGORY_REGISTRY.md and
// brain/AI/EAO_RISK_DOMAIN_REGISTRY.md exactly as committed.
//
// This is the single source of truth for category identifiers and their
// bound risk domains. Producers (project-health.mjs) and consumers
// (roadmap.mjs, adr-review.mjs, release-readiness.mjs) reference CATEGORIES
// here instead of raw string literals, eliminating the hidden category-
// coupling risk identified during Generation 2 review.
//
// Phase A scope only: this module implements Tasks 1 and 2 of Generation 2
// Phase A. It does not introduce any new category, domain, or field beyond
// what brain/AI/EAO_CATEGORY_REGISTRY.md and EAO_RISK_DOMAIN_REGISTRY.md
// already document.

export const CATEGORIES = Object.freeze({
  TERMINOLOGY_DRIFT: "terminology-drift",
  GOVERNANCE_CONNECTIVITY: "governance-connectivity",
  BROKEN_REFERENCE: "broken-reference",
  BROKEN_LINK: "broken-link",
  UNREFERENCED_CORE_DOCUMENT: "unreferenced-core-document",
  DOCUMENTATION_FORMATTING_DRIFT: "documentation-formatting-drift",
  TECHNICAL_DEBT: "technical-debt",
  MVP_IMPLEMENTATION_PENDING: "mvp-implementation-pending",
});

// category id -> bound risk domain, per brain/AI/EAO_RISK_DOMAIN_REGISTRY.md.
// riskDomain is derived from this table, never independently re-typed at a
// call site - this is what "eliminates duplicated domain definitions" means
// concretely (Task 2).
const CATEGORY_RISK_DOMAIN = Object.freeze({
  [CATEGORIES.TERMINOLOGY_DRIFT]: "Terminology",
  [CATEGORIES.GOVERNANCE_CONNECTIVITY]: "Governance",
  [CATEGORIES.BROKEN_REFERENCE]: "Documentation",
  [CATEGORIES.BROKEN_LINK]: "Documentation",
  [CATEGORIES.UNREFERENCED_CORE_DOCUMENT]: "Architecture",
  [CATEGORIES.DOCUMENTATION_FORMATTING_DRIFT]: "Documentation",
  [CATEGORIES.TECHNICAL_DEBT]: "Technical Debt",
  [CATEGORIES.MVP_IMPLEMENTATION_PENDING]: "Release",
});

export function riskDomainForCategory(categoryId) {
  return CATEGORY_RISK_DOMAIN[categoryId];
}
