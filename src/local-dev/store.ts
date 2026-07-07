import type { Person } from "../domain/person";
import type { ConsentRecord } from "../domain/consent";
import type { Payment } from "../domain/payment";
import type { Organization } from "../domain/organization";
import type { Notification } from "../domain/notification";
import type { AuditLogEntry } from "../domain/audit-log";

/**
 * Local Development Store — Foundation Build Order Step 4 (`ADR-006`).
 *
 * An in-memory, process-local structure only. This is NOT a database and
 * does not provision any external or local service — it exists purely so
 * `respublica seed-local` and local development have something to read
 * from without a real persistence layer existing yet. It resets on every
 * process restart, by design.
 *
 * Real persistence (Backend Architecture — PostgreSQL + Drizzle, per the
 * finalized Phase 2 design decisions) is separate, later, infrastructure-
 * dependent work — this store is deliberately not built to anticipate that
 * schema; it is scoped only to unblock local development now.
 */

export type LocalDevStore = {
  people: Map<string, Person>;
  consentRecords: Map<string, ConsentRecord>;
  payments: Map<string, Payment>;
  organizations: Map<string, Organization>;
  notifications: Map<string, Notification>;
  auditLog: AuditLogEntry[];
};

export function createEmptyStore(): LocalDevStore {
  return {
    people: new Map(),
    consentRecords: new Map(),
    payments: new Map(),
    organizations: new Map(),
    notifications: new Map(),
    auditLog: [],
  };
}
