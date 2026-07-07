import { z } from "zod";
import { createId, type EntityId } from "../shared";

/**
 * Organization — "one row per institutional relationship (supporter/
 * partner/funder/sponsor via relationship-type)... with a relationship-type
 * field distinguishing supporter/partner/funder roles, which may overlap"
 * (`CORE_DOMAIN_MODEL.md` §3a; `ADR-002`). CRM and Membership both
 * reference this one record rather than each maintaining a separate org
 * directory that can drift out of sync.
 *
 * Governing documents: `ADR-002`; `CORE_DOMAIN_MODEL.md` §3a (LOCKED,
 * referenced only).
 */

export const ORGANIZATION_RELATIONSHIP_TYPES = [
  "supporter",
  "partner",
  "funder",
  "sponsor",
] as const;

export type OrganizationRelationshipType = (typeof ORGANIZATION_RELATIONSHIP_TYPES)[number];

const organizationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  /** May hold more than one relationship type simultaneously — they overlap, not exclusive. */
  relationshipTypes: z.array(z.enum(ORGANIZATION_RELATIONSHIP_TYPES)).min(1),
  createdAt: z.date(),
});

export type Organization = z.infer<typeof organizationSchema>;

export type CreateOrganizationInput = {
  name: string;
  relationshipTypes: OrganizationRelationshipType[];
};

export function createOrganization(input: CreateOrganizationInput): Organization {
  const organization: Organization = {
    id: createId(),
    name: input.name,
    relationshipTypes: input.relationshipTypes,
    createdAt: new Date(),
  };
  return organizationSchema.parse(organization);
}

export function addRelationshipType(
  organization: Organization,
  type: OrganizationRelationshipType
): Organization {
  if (organization.relationshipTypes.includes(type)) {
    return organization;
  }
  return { ...organization, relationshipTypes: [...organization.relationshipTypes, type] };
}

export function hasRelationshipType(
  organization: Organization,
  type: OrganizationRelationshipType
): boolean {
  return organization.relationshipTypes.includes(type);
}

export type { EntityId };
