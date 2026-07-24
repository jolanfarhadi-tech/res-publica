import { requireAuthorization } from "../../auth/authorize";
import type { AuthenticatedActor } from "../../auth/types";

export const EDITORIAL_ROLES = ["editor", "reviewer", "translator", "publisher"] as const;
export type EditorialRole = (typeof EDITORIAL_ROLES)[number];
export type OperationalEditorialRole = Exclude<EditorialRole, "publisher">;

export function editorialCapability(role: EditorialRole): string {
  return `publishing.role.${role}`;
}

export function requireEditorialRole(
  actor: AuthenticatedActor | null,
  role: EditorialRole,
  publicationScope: string,
): asserts actor is AuthenticatedActor {
  requireAuthorization(actor, {
    domain: "civic",
    capability: editorialCapability(role),
    target: publicationScope,
    requireExactTarget: true,
    minimumAssurance: "mfa",
  });
}

export function assertEditorialDelegation(input: {
  actorPersonId: string;
  granteePersonId: string;
  role: EditorialRole;
  publicationScope: string;
}) {
  if (!input.publicationScope) throw new EditorialAuthorityError("publication_scope_required");
  if (input.actorPersonId === input.granteePersonId) throw new EditorialAuthorityError("self_grant_forbidden");
  if (input.role === "publisher") throw new EditorialAuthorityError("publisher_grant_founder_only");
}

export class EditorialAuthorityError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "EditorialAuthorityError";
  }
}
