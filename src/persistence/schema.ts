import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const people = pgTable("people", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contact: jsonb("contact").$type<{ email: string }>().notNull(),
  locale: text("locale", { enum: ["de", "en", "fa"] }).notNull(),
  rtlPreference: boolean("rtl_preference").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const consentRecords = pgTable(
  "consent_records",
  {
    id: text("id").primaryKey(),
    personId: text("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    purpose: text("purpose", {
      enum: ["tracking", "invitations", "payment-processing", "event-pii"],
    }).notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true, mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [index("consent_records_person_purpose_idx").on(table.personId, table.purpose)]
);

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    payerId: text("payer_id").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
    currency: text("currency").notNull(),
    purpose: text("purpose").notNull(),
    providerReference: text("provider_reference"),
    status: text("status", {
      enum: ["pending", "settled", "failed", "refunded"],
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    settledAt: timestamp("settled_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [index("payments_payer_idx").on(table.payerId)]
);

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  relationshipTypes: jsonb("relationship_types")
    .$type<Array<"supporter" | "partner" | "funder" | "sponsor">>()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    recipientPersonId: text("recipient_person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    channel: text("channel", { enum: ["email", "in-app"] }).notNull(),
    template: text("template").notNull(),
    status: text("status", { enum: ["pending", "sent", "failed"] }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [index("notifications_recipient_idx").on(table.recipientPersonId)]
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").notNull(),
    actorPersonId: text("actor_person_id").references(() => people.id, {
      onDelete: "restrict",
    }),
    action: text("action").notNull(),
    target: text("target").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull(),
    pseudonymized: boolean("pseudonymized").notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.timestamp, table.id] }),
    index("audit_log_actor_idx").on(table.actorPersonId),
  ]
);

export type PersistenceSchema = {
  people: typeof people;
  consentRecords: typeof consentRecords;
  payments: typeof payments;
  organizations: typeof organizations;
  notifications: typeof notifications;
  auditLog: typeof auditLog;
};
