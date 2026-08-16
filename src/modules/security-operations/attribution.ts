import { createHmac } from "node:crypto";
import { isIP } from "node:net";

export const ATTRIBUTION_LEVELS = ["A", "B", "C", "D", "E"] as const;
export type AttributionLevel = (typeof ATTRIBUTION_LEVELS)[number];

export const ATTRIBUTION_CONFIDENCE = ["LOW", "MODERATE", "HIGH"] as const;
export type AttributionConfidence = (typeof ATTRIBUTION_CONFIDENCE)[number];

export const INCIDENT_RELATIONS = [
  "LIKELY RELATED",
  "POSSIBLY RELATED",
  "INSUFFICIENT EVIDENCE",
  "NOT RELATED",
] as const;
export type IncidentRelation = (typeof INCIDENT_RELATIONS)[number];

export const CORRELATION_SIGNALS = [
  "source-infrastructure",
  "route-order",
  "timing-pattern",
  "retry-behavior",
  "protocol-characteristics",
  "session-transition",
  "source-switching",
  "decoy-preference",
  "canary-interaction",
  "technique-sequence",
  "error-pattern",
  "defensive-response",
  "targeting-preference",
] as const;
export type CorrelationSignal = (typeof CORRELATION_SIGNALS)[number];

export const SECURITY_ASSETS = [
  "public-site",
  "public-api",
  "authentication",
  "membership",
  "academy",
  "fellowship",
  "knowledge-graph",
  "search",
  "ai-rag",
  "operations",
  "security-operations",
  "research-zk",
  "credential-issuance",
  "database",
  "background-jobs",
] as const;
export type SecurityAsset = (typeof SECURITY_ASSETS)[number];

export const OBSERVED_TECHNIQUES = [
  "credential-access",
  "route-enumeration",
  "authorization-probing",
  "resource-exhaustion",
  "rate-limit-evasion",
  "session-replay",
  "injection-attempt",
  "dependency-tampering",
  "data-integrity-attempt",
  "deception-interaction",
  "decoy-interaction",
  "canary-interaction",
  "honeypot-interaction",
] as const;
export type ObservedTechnique = (typeof OBSERVED_TECHNIQUES)[number];

type ObservationSource =
  | "application-request"
  | "provider-export"
  | "canonical-audit"
  | "human-security-review";

export type TechnicalObservationInput = {
  incidentId: string;
  correlationScope: string;
  correlationSecret: string;
  observedAt: Date;
  source: ObservationSource;
  sourceAddress?: string;
  sourcePort?: number;
  authenticationSubject?: string;
  sessionId?: string;
  apiCredentialId?: string;
  routes: string[];
  userAgent?: string;
  protocol?: string;
  tlsVersion?: string;
  techniques: ObservedTechnique[];
  affectedAssets: SecurityAsset[];
};

export type TechnicalObservation = {
  incidentId: string;
  observedAt: Date;
  source: ObservationSource;
  sourceHandle: string | null;
  sourcePort: number | null;
  actorHandle: string | null;
  sessionHandle: string | null;
  apiCredentialHandle: string | null;
  routeSequence: string[];
  userAgentFamily: "chromium" | "firefox" | "safari" | "other" | null;
  protocol: string | null;
  tlsVersion: string | null;
  techniques: ObservedTechnique[];
  affectedAssets: SecurityAsset[];
};

export type AttributionClaimInput = {
  level: AttributionLevel;
  claim: string;
  observedEvidence: string[];
  inferences: string[];
  contradictoryEvidence: string[];
  alternativeExplanations: string[];
  confidence: AttributionConfidence;
  source: "human-security-review" | "provider-export" | "canonical-audit";
  timestamp: Date;
};

export type SupportedAttributionClaim = Omit<AttributionClaimInput, "level"> & {
  level: Exclude<AttributionLevel, "E">;
};

function opaqueHandle(
  prefix: "src" | "act" | "ses" | "api",
  secret: string,
  scope: string,
  value: string | undefined
): string | null {
  if (!value) return null;
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new AttributionValidationError("correlation_secret_too_short");
  }
  if (!scope.trim()) throw new AttributionValidationError("correlation_scope_required");
  const digest = createHmac("sha256", secret)
    .update(`${scope}\u0000${prefix}\u0000${value}`)
    .digest("hex")
    .slice(0, 32);
  return `${prefix}_${digest}`;
}

function normalizedRoute(value: string): string {
  try {
    const url = new URL(value, "https://internal.invalid");
    if (!url.pathname.startsWith("/") || url.pathname.length > 256) {
      throw new Error("invalid route");
    }
    const decoded = decodeURIComponent(url.pathname);
    return decoded
      .split("/")
      .map((segment) => {
        if (
          /\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(segment) ||
          /@/.test(segment) ||
          /auth0\|/i.test(segment) ||
          /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment) ||
          /^[A-Za-z0-9_-]{33,}$/.test(segment)
        ) {
          return ":id";
        }
        return segment;
      })
      .join("/");
  } catch {
    throw new AttributionValidationError("invalid_route");
  }
}

function userAgentFamily(value: string | undefined): TechnicalObservation["userAgentFamily"] {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes("firefox/")) return "firefox";
  if (normalized.includes("edg/") || normalized.includes("chrome/") || normalized.includes("chromium/")) {
    return "chromium";
  }
  if (normalized.includes("safari/") && normalized.includes("version/")) return "safari";
  return "other";
}

function boundedProtocol(value: string | undefined, field: "protocol" | "tls_version"): string | null {
  if (!value) return null;
  if (!/^[A-Za-z0-9._/-]{1,32}$/.test(value)) {
    throw new AttributionValidationError(`invalid_${field}`);
  }
  return value;
}

function boundedDistinct<T extends string>(
  values: readonly T[],
  allowed: readonly T[],
  field: string,
  maximum: number
): T[] {
  const distinct = [...new Set(values)];
  if (distinct.length > maximum || distinct.some((value) => !allowed.includes(value))) {
    throw new AttributionValidationError(`invalid_${field}`);
  }
  return distinct;
}

export function buildTechnicalObservation(
  input: TechnicalObservationInput
): TechnicalObservation {
  if (!input.incidentId.trim()) throw new AttributionValidationError("incident_id_required");
  if (!Number.isFinite(input.observedAt.getTime())) {
    throw new AttributionValidationError("invalid_observation_timestamp");
  }
  if (input.sourcePort !== undefined && (!Number.isInteger(input.sourcePort) || input.sourcePort < 1 || input.sourcePort > 65_535)) {
    throw new AttributionValidationError("invalid_source_port");
  }
  if (input.sourceAddress !== undefined && isIP(input.sourceAddress) === 0) {
    throw new AttributionValidationError("invalid_source_address");
  }
  if (input.routes.length > 32) throw new AttributionValidationError("too_many_routes");

  return {
    incidentId: input.incidentId,
    observedAt: input.observedAt,
    source: input.source,
    sourceHandle: opaqueHandle("src", input.correlationSecret, input.correlationScope, input.sourceAddress),
    sourcePort: input.sourcePort ?? null,
    actorHandle: opaqueHandle("act", input.correlationSecret, input.correlationScope, input.authenticationSubject),
    sessionHandle: opaqueHandle("ses", input.correlationSecret, input.correlationScope, input.sessionId),
    apiCredentialHandle: opaqueHandle("api", input.correlationSecret, input.correlationScope, input.apiCredentialId),
    routeSequence: input.routes.map(normalizedRoute),
    userAgentFamily: userAgentFamily(input.userAgent),
    protocol: boundedProtocol(input.protocol, "protocol"),
    tlsVersion: boundedProtocol(input.tlsVersion, "tls_version"),
    techniques: boundedDistinct(input.techniques, OBSERVED_TECHNIQUES, "techniques", 16),
    affectedAssets: boundedDistinct(input.affectedAssets, SECURITY_ASSETS, "affected_assets", 16),
  };
}

function requireStatements(values: string[], code: string): string[] {
  if (!values.length) throw new AttributionValidationError(code);
  return values.map((value) => {
    const normalized = value.trim();
    if (!normalized || normalized.length > 1_000) {
      throw new AttributionValidationError(code);
    }
    assertPrivacySafeAttributionText(normalized);
    return normalized;
  });
}

export function assertPrivacySafeAttributionText(value: string): void {
  if (
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(value) ||
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value) ||
    /\bauth0\|/i.test(value) ||
    /\bbearer\s+[a-z0-9._~-]+/i.test(value) ||
    /https?:\/\/\S+[?&][^\s=]+=/i.test(value)
  ) {
    throw new AttributionValidationError("raw_identifier_not_allowed");
  }
}

export function validateAttributionClaim(input: AttributionClaimInput): SupportedAttributionClaim {
  if (input.level === "E") {
    throw new AttributionValidationError("real_world_identity_not_supported");
  }
  const claim = input.claim.trim();
  if (!claim || claim.length > 1_000) throw new AttributionValidationError("claim_required");
  assertPrivacySafeAttributionText(claim);
  if (!ATTRIBUTION_CONFIDENCE.includes(input.confidence)) {
    throw new AttributionValidationError("invalid_confidence");
  }
  if (!Number.isFinite(input.timestamp.getTime())) {
    throw new AttributionValidationError("invalid_claim_timestamp");
  }
  return {
    ...input,
    level: input.level,
    claim,
    observedEvidence: requireStatements(input.observedEvidence, "observed_evidence_required"),
    inferences: requireStatements(input.inferences, "inference_required"),
    contradictoryEvidence: requireStatements(
      input.contradictoryEvidence,
      "contradictory_evidence_required"
    ),
    alternativeExplanations: requireStatements(
      input.alternativeExplanations,
      "alternative_explanation_required"
    ),
  };
}

export function correlateIncidentSignals(input: {
  leftIncidentId: string;
  rightIncidentId: string;
  matchingSignals: CorrelationSignal[];
  contradictorySignals: string[];
  reviewedAt: Date;
}): {
  leftIncidentId: string;
  rightIncidentId: string;
  relation: IncidentRelation;
  matchingSignals: CorrelationSignal[];
  contradictorySignals: string[];
  alternativeExplanations: string[];
  reviewedAt: Date;
} {
  if (!input.leftIncidentId || !input.rightIncidentId || input.leftIncidentId === input.rightIncidentId) {
    throw new AttributionValidationError("distinct_incidents_required");
  }
  if (!Number.isFinite(input.reviewedAt.getTime())) {
    throw new AttributionValidationError("invalid_review_timestamp");
  }
  const matchingSignals = boundedDistinct(
    input.matchingSignals,
    CORRELATION_SIGNALS,
    "matching_signals",
    CORRELATION_SIGNALS.length
  );
  const contradictorySignals = input.contradictorySignals.map((value) => {
    const normalized = value.trim();
    if (!normalized || normalized.length > 500) {
      throw new AttributionValidationError("invalid_contradictory_signal");
    }
    assertPrivacySafeAttributionText(normalized);
    return normalized;
  });
  const decisiveContradiction = contradictorySignals.some((value) =>
    [
      "mutually-exclusive-session-timing",
      "cryptographically-distinct-credential",
      "operator-confirmed-unrelated-test-traffic",
    ].includes(value)
  );
  const relation: IncidentRelation = decisiveContradiction
    ? "NOT RELATED"
    : contradictorySignals.length
      ? "INSUFFICIENT EVIDENCE"
    : matchingSignals.length >= 3
      ? "LIKELY RELATED"
      : matchingSignals.length >= 2
        ? "POSSIBLY RELATED"
        : "INSUFFICIENT EVIDENCE";

  return {
    leftIncidentId: input.leftIncidentId,
    rightIncidentId: input.rightIncidentId,
    relation,
    matchingSignals,
    contradictorySignals,
    alternativeExplanations: [
      "Shared tools, infrastructure or copied techniques can create similar signals without common authorship.",
      "A compromised account or network endpoint does not identify the person who performed the activity.",
    ],
    reviewedAt: input.reviewedAt,
  };
}

export class AttributionValidationError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "AttributionValidationError";
  }
}
