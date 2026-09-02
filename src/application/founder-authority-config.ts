import { z } from "zod";

const appointmentEnvironmentSchema = z.object({
  DATABASE_URL: z.string().min(1),
  FOUNDER_APPOINTMENT_CONFIRMATION: z.literal(
    "RECORD-EXTERNALLY-APPROVED-FOUNDATIONAL-AUTHORITY"
  ),
  FOUNDER_APPROVAL_ISSUER: z.string().min(1).max(500),
  FOUNDER_APPROVAL_SUBJECT: z.string().min(1).max(500),
  FOUNDER_APPOINTEE_ISSUER: z.string().min(1).max(500),
  FOUNDER_APPOINTEE_SUBJECT: z.string().min(1).max(500),
  FOUNDER_AUTHORITY: z.enum(["institution-admin", "publisher"]),
  FOUNDER_AUTHORITY_TARGET: z.string().trim().min(1).max(200),
  FOUNDER_APPROVAL_REQUEST_ID: z.string().uuid(),
  FOUNDER_AUTHORITY_VALID_UNTIL: z.string().datetime().optional(),
});

export function readFounderAuthorityAppointmentEnvironment(
  environment: Record<string, string | undefined>
) {
  const parsed = appointmentEnvironmentSchema.safeParse(environment);
  if (!parsed.success) {
    throw new FounderAuthorityConfigurationError();
  }
  const validUntil = parsed.data.FOUNDER_AUTHORITY_VALID_UNTIL
    ? new Date(parsed.data.FOUNDER_AUTHORITY_VALID_UNTIL)
    : null;
  return {
    databaseUrl: parsed.data.DATABASE_URL,
    appointment: {
      approvalAuthority: {
        issuer: parsed.data.FOUNDER_APPROVAL_ISSUER,
        subject: parsed.data.FOUNDER_APPROVAL_SUBJECT,
      },
      appointee: {
        issuer: parsed.data.FOUNDER_APPOINTEE_ISSUER,
        subject: parsed.data.FOUNDER_APPOINTEE_SUBJECT,
      },
      authority: parsed.data.FOUNDER_AUTHORITY,
      target: parsed.data.FOUNDER_AUTHORITY_TARGET,
      validUntil,
      approvalRequestId: parsed.data.FOUNDER_APPROVAL_REQUEST_ID,
    },
  };
}

export class FounderAuthorityConfigurationError extends Error {
  constructor() {
    super("founder_authority_configuration_invalid");
    this.name = "FounderAuthorityConfigurationError";
  }
}
