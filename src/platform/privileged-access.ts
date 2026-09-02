export const PRIVILEGED_REASON_CODES = [
  "operational-role-assignment",
  "founder-authority-appointment",
  "scheduled-access-review",
  "duty-reassignment",
  "membership-board-approval",
  "membership-board-rejection",
  "fellowship-role-scope-approval",
  "fellowship-candidacy-decision",
  "fellowship-status-change",
  "credential-issuance",
  "incident-containment",
  "security-incident-recording",
  "security-attribution-review",
  "security-defensive-response",
] as const;

export type PrivilegedReasonCode = (typeof PRIVILEGED_REASON_CODES)[number];

export type PrivilegedActionContext = {
  requestId: string;
  reasonCode: PrivilegedReasonCode;
};

const REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertPrivilegedActionContext(
  context: PrivilegedActionContext,
  allowedReasonCodes: readonly PrivilegedReasonCode[] = PRIVILEGED_REASON_CODES
): void {
  if (!REQUEST_ID.test(context.requestId)) {
    throw new PrivilegedAccessContextError("invalid_request_id");
  }
  if (!PRIVILEGED_REASON_CODES.includes(context.reasonCode)) {
    throw new PrivilegedAccessContextError("invalid_reason_code");
  }
  if (!allowedReasonCodes.includes(context.reasonCode)) {
    throw new PrivilegedAccessContextError("reason_code_not_allowed");
  }
}

export class PrivilegedAccessContextError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "PrivilegedAccessContextError";
  }
}
