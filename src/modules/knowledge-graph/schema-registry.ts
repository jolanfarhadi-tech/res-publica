import type { BusinessDomain } from "../../platform/domain";
import type { EntityType, RelationshipType } from "./types";

export type GraphSchemaRegistration = {
  kind: "entity" | "relationship";
  name: EntityType | RelationshipType;
  owningDomain: BusinessDomain;
};

/**
 * Accepted ADR-007 Civic/content vocabulary. Governance specializations stay
 * unavailable until their separately reserved operational rules are accepted.
 */
export const graphSchemaRegistry: readonly GraphSchemaRegistration[] = [
  { kind: "entity", name: "person", owningDomain: "civic" },
  { kind: "entity", name: "organization", owningDomain: "civic" },
  { kind: "entity", name: "topic", owningDomain: "civic" },
  { kind: "entity", name: "legislation", owningDomain: "civic" },
  { kind: "entity", name: "dialogue", owningDomain: "civic" },
  { kind: "entity", name: "finding", owningDomain: "civic" },
  { kind: "relationship", name: "co-occurs", owningDomain: "civic" },
] as const;

export function ownsGraphType(
  domain: BusinessDomain,
  kind: "entity" | "relationship",
  name: string
): boolean {
  return graphSchemaRegistry.some(
    (registration) =>
      registration.owningDomain === domain &&
      registration.kind === kind &&
      registration.name === name
  );
}
