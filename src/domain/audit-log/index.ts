import { z } from "zod";
import { createId, type EntityId } from "../shared";

/**
 * AuditLog — "append-only actor/action/target/timestamp record... Created
 * per institutional action; never edited (pseudonymized on erasure)"
 * (`CORE_DOMAIN_MODEL.md` §3a; `ADR-002`).
 *
 * Invariants (`CORE_DOMAIN_MODEL.md` §9):
 *   - "No institutional action... occurs without a corresponding AuditLog
 *     entry" — callers are expected to call `appendEntry` alongside every
 *     institutional action; this module cannot enforce that from outside.
 *   - "AuditLog is append-only; existing entries are never edited, only
 *     pseudonymized on erasure per the already-approved GDPR pattern."
 *     Enforced here: `appendEntry` returns a frozen object, and no function
 *     in this module mutates an existing entry in place — pseudonymization
 *     returns a new, frozen entry.
 *
 * GDPR erasure/pseudonymization — PRODUCTION ACTIVATION DEFERRED.
 * `ADR-002`'s Foundation Stabilization amendment records: "the Foundation
 * Review recommends legal/data-protection sign-off before any
 * AuditLog-writing module reaches Phase 1, and that recommendation stands
 * alongside this resolution rather than being superseded by it." That
 * sign-off is still outstanding per `brain/ROADMAP.md`. `pseudonymizeEntry`
 * below is implemented and exercised by validation, but refuses to run
 * unless `AUDIT_LOG_ERASURE_LEGALLY_APPROVED` is explicitly flipped to
 * `true` — do not flip it without that sign-off having actually occurred.
 *
 * Governing documents: `ADR-002` (Domain Model + Foundation Stabilization
 * amendment); `CORE_DOMAIN_MODEL.md` §3a/§9 (LOCKED, referenced only).
 */

const auditLogEntrySchema = z.object({
  id: z.string(),
  actorPersonId: z.string().nullable(),
  action: z.string().min(1),
  target: z.string().min(1),
  timestamp: z.date(),
  pseudonymized: z.boolean(),
});

export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;

export type AppendEntryInput = {
  actorPersonId: EntityId;
  action: string;
  target: string;
};

export function appendEntry(input: AppendEntryInput): Readonly<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: createId(),
    actorPersonId: input.actorPersonId,
    action: input.action,
    target: input.target,
    timestamp: new Date(),
    pseudonymized: false,
  };
  return Object.freeze(auditLogEntrySchema.parse(entry));
}

/**
 * Not yet activated for production use — see module-level note above.
 * Flip only once the outstanding legal/data-protection sign-off recorded
 * in `ADR-002`'s amendment and `brain/ROADMAP.md` has actually occurred.
 */
export const AUDIT_LOG_ERASURE_LEGALLY_APPROVED = false;

export function pseudonymizeEntry(entry: AuditLogEntry): Readonly<AuditLogEntry> {
  if (!AUDIT_LOG_ERASURE_LEGALLY_APPROVED) {
    throw new Error(
      "AuditLog pseudonymization-on-erasure is implemented but not activated: " +
        "pending outstanding legal/data-protection sign-off (ADR-002 amendment; brain/ROADMAP.md). " +
        "Do not enable AUDIT_LOG_ERASURE_LEGALLY_APPROVED without that sign-off."
    );
  }
  if (entry.pseudonymized) {
    return entry;
  }
  return Object.freeze({
    ...entry,
    actorPersonId: null,
    pseudonymized: true,
  });
}
