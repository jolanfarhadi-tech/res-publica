import { asc, eq } from "drizzle-orm";
import type { AuditLogEntry } from "../domain/audit-log";
import type { ConsentRecord } from "../domain/consent";
import type { Notification } from "../domain/notification";
import type { Organization } from "../domain/organization";
import type { Payment } from "../domain/payment";
import type { Person } from "../domain/person";
import type { Database } from "./database";
import {
  auditLog,
  consentRecords,
  notifications,
  organizations,
  payments,
  people,
} from "./schema";

type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
type Executor = Database | Transaction;

export function createRepositories(executor: Executor) {
  return {
    people: {
      async save(person: Person): Promise<Person> {
        const [saved] = await executor.insert(people).values(person).returning();
        return saved;
      },
      async findById(id: string): Promise<Person | null> {
        const [person] = await executor.select().from(people).where(eq(people.id, id)).limit(1);
        return person ?? null;
      },
    },
    consentRecords: {
      async save(record: ConsentRecord): Promise<ConsentRecord> {
        const [saved] = await executor.insert(consentRecords).values(record).returning();
        return saved;
      },
      async replace(record: ConsentRecord): Promise<ConsentRecord> {
        const [saved] = await executor
          .update(consentRecords)
          .set({ revokedAt: record.revokedAt })
          .where(eq(consentRecords.id, record.id))
          .returning();
        if (!saved) throw new Error(`ConsentRecord ${record.id} does not exist`);
        return saved;
      },
    },
    payments: {
      async save(payment: Payment): Promise<Payment> {
        const [saved] = await executor.insert(payments).values(payment).returning();
        return saved;
      },
      async replace(payment: Payment): Promise<Payment> {
        const [saved] = await executor
          .update(payments)
          .set({
            providerReference: payment.providerReference,
            status: payment.status,
            settledAt: payment.settledAt,
          })
          .where(eq(payments.id, payment.id))
          .returning();
        if (!saved) throw new Error(`Payment ${payment.id} does not exist`);
        return saved;
      },
    },
    organizations: {
      async save(organization: Organization): Promise<Organization> {
        const [saved] = await executor.insert(organizations).values(organization).returning();
        return saved;
      },
      async replace(organization: Organization): Promise<Organization> {
        const [saved] = await executor
          .update(organizations)
          .set({ name: organization.name, relationshipTypes: organization.relationshipTypes })
          .where(eq(organizations.id, organization.id))
          .returning();
        if (!saved) throw new Error(`Organization ${organization.id} does not exist`);
        return saved;
      },
    },
    notifications: {
      async save(notification: Notification): Promise<Notification> {
        const [saved] = await executor.insert(notifications).values(notification).returning();
        return saved;
      },
      async replace(notification: Notification): Promise<Notification> {
        const [saved] = await executor
          .update(notifications)
          .set({ status: notification.status, sentAt: notification.sentAt })
          .where(eq(notifications.id, notification.id))
          .returning();
        if (!saved) throw new Error(`Notification ${notification.id} does not exist`);
        return saved;
      },
    },
    auditLog: {
      async append(entry: AuditLogEntry): Promise<AuditLogEntry> {
        const [saved] = await executor.insert(auditLog).values(entry).returning();
        return saved;
      },
      async list(): Promise<AuditLogEntry[]> {
        return executor
          .select()
          .from(auditLog)
          .orderBy(asc(auditLog.timestamp), asc(auditLog.id));
      },
    },
  };
}

export async function inUnitOfWork<T>(
  db: Database,
  operation: (repositories: ReturnType<typeof createRepositories>) => Promise<T>
): Promise<T> {
  return db.transaction((transaction) => operation(createRepositories(transaction)));
}
