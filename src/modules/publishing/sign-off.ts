import { createId } from "../../domain/shared";
import { appendEntry } from "../../domain/audit-log";
import type { AuditLogEntry } from "../../domain/audit-log";
import type { DraftDocument, SignOffRecord } from "./types";

/**
 * Sign-off/Approval — the org's core trust mechanism depends on every
 * publish requiring a named human. Every sign-off writes a real
 * `AuditLog` entry (`ADR-002`) — real cross-module integration with the
 * Step 1 domain layer, not a parallel approval record.
 */
export function signOff(
  draft: DraftDocument,
  approverPersonId: string
): { record: SignOffRecord; auditEntry: AuditLogEntry } {
  const record: SignOffRecord = {
    id: createId(),
    draftId: draft.id,
    approverPersonId,
    timestamp: new Date(),
  };
  const auditEntry = appendEntry({
    actorPersonId: approverPersonId,
    action: "publishing.sign-off",
    target: draft.id,
  });
  return { record, auditEntry };
}
