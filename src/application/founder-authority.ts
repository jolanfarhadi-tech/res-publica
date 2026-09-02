import { and, eq, gt, isNull, lte, or } from "drizzle-orm";
import { createId } from "../domain/shared";
import { governanceCapability } from "../modules/harm-governance/authority";
import { editorialCapability } from "../modules/publishing/authority";
import type { Database } from "../persistence";
import {
  auditLog,
  authIdentities,
  authorizationGrants,
} from "../persistence/schema";
import { assertPrivilegedActionContext } from "../platform/privileged-access";

type IdentityReference = {
  issuer: string;
  subject: string;
};

export type FoundationalAuthority = "institution-admin" | "publisher";

export type FounderAuthorityAppointment = {
  approvalAuthority: IdentityReference;
  appointee: IdentityReference;
  authority: FoundationalAuthority;
  target: string;
  validUntil: Date | null;
  approvalRequestId: string;
};

const MAX_IDENTITY_COMPONENT_LENGTH = 500;
const MAX_TARGET_LENGTH = 200;

/**
 * Persists a Founder/Human Approval Authority decision made outside the web
 * application, as required by ADR-033 and ADR-036. This function is
 * intentionally not exposed by an HTTP route. The caller must operate the
 * controlled provisioning command with a migration-capable database session.
 */
export async function recordFounderAuthorityAppointment(
  db: Database,
  input: FounderAuthorityAppointment,
  now = new Date()
) {
  assertAppointmentInput(input, now);
  assertPrivilegedActionContext(
    {
      requestId: input.approvalRequestId,
      reasonCode: "founder-authority-appointment",
    },
    ["founder-authority-appointment"]
  );

  const capability = input.authority === "institution-admin"
    ? governanceCapability("institution-admin")
    : editorialCapability("publisher");
  const domain: "governance" | "civic" = input.authority === "institution-admin"
    ? "governance"
    : "civic";
  const action = input.authority === "institution-admin"
    ? "governance.institution-admin-appointed"
    : "publishing.publisher-appointed";

  return db.transaction(async (transaction) => {
    // Lock the approval identity first. Concurrent operator invocations for
    // the same recorded authority decision are therefore serialized.
    const [approvalIdentity] = await transaction
      .select({ personId: authIdentities.personId })
      .from(authIdentities)
      .where(and(
        eq(authIdentities.issuer, input.approvalAuthority.issuer),
        eq(authIdentities.subject, input.approvalAuthority.subject),
        isNull(authIdentities.disabledAt)
      ))
      .limit(1)
      .for("update");
    if (!approvalIdentity) {
      throw new FounderAuthorityAppointmentError(
        "approval_authority_identity_not_found"
      );
    }

    const [appointeeIdentity] = await transaction
      .select({ personId: authIdentities.personId })
      .from(authIdentities)
      .where(and(
        eq(authIdentities.issuer, input.appointee.issuer),
        eq(authIdentities.subject, input.appointee.subject),
        isNull(authIdentities.disabledAt)
      ))
      .limit(1)
      .for("update");
    if (!appointeeIdentity) {
      throw new FounderAuthorityAppointmentError("appointee_identity_not_found");
    }
    if (approvalIdentity.personId === appointeeIdentity.personId) {
      throw new FounderAuthorityAppointmentError("self_appointment_forbidden");
    }

    const [existing] = await transaction
      .select({ id: authorizationGrants.id })
      .from(authorizationGrants)
      .where(and(
        eq(authorizationGrants.personId, appointeeIdentity.personId),
        eq(authorizationGrants.domain, domain),
        eq(authorizationGrants.capability, capability),
        eq(authorizationGrants.target, input.target),
        isNull(authorizationGrants.revokedAt),
        lte(authorizationGrants.validFrom, now),
        or(
          isNull(authorizationGrants.validUntil),
          gt(authorizationGrants.validUntil, now)
        )
      ))
      .limit(1)
      .for("update");
    if (existing) {
      throw new FounderAuthorityAppointmentError("authority_already_active");
    }

    const grant = {
      id: createId(),
      personId: appointeeIdentity.personId,
      domain,
      capability,
      target: input.target,
      assuranceRequired: "mfa" as const,
      validFrom: now,
      validUntil: input.validUntil,
      grantedByPersonId: approvalIdentity.personId,
      revokedAt: null,
    };
    await transaction.insert(authorizationGrants).values(grant);
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: approvalIdentity.personId,
      action,
      target: `authorization-grant:${grant.id}`,
      sessionId: null,
      requestId: input.approvalRequestId,
      capability,
      reasonCode: "founder-authority-appointment",
      timestamp: now,
      pseudonymized: false,
    });
    return grant;
  });
}

function assertAppointmentInput(
  input: FounderAuthorityAppointment,
  now: Date
) {
  if (!Number.isFinite(now.getTime())) {
    throw new FounderAuthorityAppointmentError("appointment_time_invalid");
  }
  for (const identity of [input.approvalAuthority, input.appointee]) {
    if (
      !identity.issuer ||
      identity.issuer.length > MAX_IDENTITY_COMPONENT_LENGTH ||
      !identity.subject ||
      identity.subject.length > MAX_IDENTITY_COMPONENT_LENGTH
    ) {
      throw new FounderAuthorityAppointmentError("identity_reference_invalid");
    }
  }
  if (
    !input.target ||
    input.target !== input.target.trim() ||
    input.target.length > MAX_TARGET_LENGTH
  ) {
    throw new FounderAuthorityAppointmentError("authority_target_invalid");
  }
  if (
    input.validUntil !== null &&
    (!Number.isFinite(input.validUntil.getTime()) || input.validUntil <= now)
  ) {
    throw new FounderAuthorityAppointmentError("authority_expiry_invalid");
  }
}

export class FounderAuthorityAppointmentError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "FounderAuthorityAppointmentError";
  }
}
