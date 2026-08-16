import type { AuthorizationDomain } from "../auth/types";

export const CAPABILITY_QUARANTINE_ENV = "SECURITY_QUARANTINED_CAPABILITIES";
export const WRITE_SCOPE_QUARANTINE_ENV = "SECURITY_FROZEN_WRITE_SCOPES";
export const RESEARCH_FAIL_CLOSED_ENV = "SECURITY_FORCE_RESEARCH_FAIL_CLOSED";

const CAPABILITY_KEY = /^(civic|governance):[a-z0-9][a-z0-9.-]{0,127}$/;
const WRITE_SCOPE = /^[a-z0-9][a-z0-9.-]{0,127}$/;

type Environment = Record<string, string | undefined>;
type ParsedList = { values: readonly string[]; valid: boolean };

export type CapabilityQuarantine = {
  capabilityKeys: readonly string[];
  frozenWriteScopes: readonly string[];
  forceResearchClosed: boolean;
  valid: boolean;
};

function parseList(value: string | undefined, pattern: RegExp): ParsedList {
  if (value === undefined || value.trim() === "") {
    return { values: [], valid: true };
  }
  const values = value.split(",").map((entry) => entry.trim());
  if (values.some((entry) => !pattern.test(entry))) {
    return { values: [], valid: false };
  }
  return { values: [...new Set(values)].sort(), valid: true };
}

function parseResearchFailClosed(value: string | undefined) {
  if (value === undefined || value.trim() === "" || value === "false") {
    return { enabled: false, valid: true };
  }
  if (value === "true") return { enabled: true, valid: true };
  return { enabled: true, valid: false };
}

export function readCapabilityQuarantine(
  environment: Environment = process.env
): CapabilityQuarantine {
  const capabilities = parseList(
    environment[CAPABILITY_QUARANTINE_ENV], CAPABILITY_KEY
  );
  const scopes = parseList(environment[WRITE_SCOPE_QUARANTINE_ENV], WRITE_SCOPE);
  const research = parseResearchFailClosed(environment[RESEARCH_FAIL_CLOSED_ENV]);
  return {
    capabilityKeys: capabilities.values,
    frozenWriteScopes: scopes.values,
    forceResearchClosed: research.enabled,
    valid: capabilities.valid && scopes.valid && research.valid,
  };
}

export function isCapabilityQuarantined(
  domain: AuthorizationDomain,
  capability: string,
  environment: Environment = process.env
): boolean {
  const parsed = parseList(environment[CAPABILITY_QUARANTINE_ENV], CAPABILITY_KEY);
  if (!parsed.valid) return true;
  return parsed.values.includes(`${domain}:${capability}`);
}

export function isWriteScopeQuarantined(
  scope: string,
  environment: Environment = process.env
): boolean {
  const parsed = parseList(environment[WRITE_SCOPE_QUARANTINE_ENV], WRITE_SCOPE);
  return !parsed.valid || parsed.values.includes(scope);
}

export function isResearchForcedClosed(
  environment: Environment = process.env
): boolean {
  return parseResearchFailClosed(environment[RESEARCH_FAIL_CLOSED_ENV]).enabled;
}
