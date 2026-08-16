import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  uniqueIndex,
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
      enum: [
        "tracking",
        "invitations",
        "payment-processing",
        "event-pii",
        "profile-data-protection-v1-de",
        "profile-data-protection-v1-en",
        "profile-data-protection-v1-fa",
        "profile-programme-participation-v1-de",
        "profile-programme-participation-v1-en",
        "profile-programme-participation-v1-fa",
      ],
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

export const notificationDeliveryAttempts = pgTable(
  "notification_delivery_attempts",
  {
    id: text("id").primaryKey(),
    notificationId: text("notification_id")
      .notNull()
      .references(() => notifications.id, { onDelete: "restrict" }),
    attemptNumber: integer("attempt_number").notNull(),
    provider: text("provider").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    status: text("status", {
      enum: ["started", "sent", "failed"],
    }).notNull(),
    retryable: boolean("retryable"),
    providerMessageId: text("provider_message_id"),
    errorCode: text("error_code"),
    startedAt: timestamp("started_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    uniqueIndex("notification_delivery_attempts_notification_number_uq").on(
      table.notificationId,
      table.attemptNumber
    ),
    uniqueIndex("notification_delivery_attempts_idempotency_uq").on(
      table.idempotencyKey
    ),
    index("notification_delivery_attempts_notification_idx").on(
      table.notificationId
    ),
  ]
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
    sessionId: text("session_id"),
    requestId: text("request_id"),
    capability: text("capability"),
    reasonCode: text("reason_code"),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull(),
    pseudonymized: boolean("pseudonymized").notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.timestamp, table.id] }),
    index("audit_log_actor_idx").on(table.actorPersonId),
    index("audit_log_session_idx").on(table.sessionId),
    index("audit_log_request_idx").on(table.requestId),
  ]
);

export const authIdentities = pgTable(
  "auth_identities",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    issuer: text("issuer").notNull(),
    subject: text("subject").notNull(),
    linkedAt: timestamp("linked_at", { withTimezone: true, mode: "date" }).notNull(),
    disabledAt: timestamp("disabled_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("auth_identities_issuer_subject_uq").on(table.issuer, table.subject),
    index("auth_identities_person_idx").on(table.personId),
  ]
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    authIdentityId: text("auth_identity_id").notNull().references(() => authIdentities.id, { onDelete: "restrict" }),
    tokenHash: text("token_hash").notNull(),
    assurance: text("assurance", { enum: ["verified", "mfa", "recent-mfa"] }).notNull(),
    authenticatedAt: timestamp("authenticated_at", { withTimezone: true, mode: "date" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("auth_sessions_token_hash_uq").on(table.tokenHash),
    index("auth_sessions_identity_idx").on(table.authIdentityId),
  ]
);

export const authFlows = pgTable(
  "auth_flows",
  {
    stateHash: text("state_hash").primaryKey(),
    codeVerifier: text("code_verifier").notNull(),
    nonce: text("nonce").notNull(),
    returnTo: text("return_to").notNull(),
    intent: text("intent", { enum: ["login", "signup"] }).notNull().default("login"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [index("auth_flows_expires_idx").on(table.expiresAt)]
);

export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    scope: text("scope").notNull(),
    identifierHash: text("identifier_hash").notNull(),
    windowStartedAt: timestamp("window_started_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    requestCount: integer("request_count").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.scope, table.identifierHash] }),
    index("rate_limit_buckets_expires_idx").on(table.expiresAt),
  ]
);

export const authorizationGrants = pgTable(
  "authorization_grants",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    domain: text("domain", { enum: ["civic", "governance"] }).notNull(),
    capability: text("capability").notNull(),
    target: text("target"),
    assuranceRequired: text("assurance_required", { enum: ["verified", "mfa", "recent-mfa"] }).notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true, mode: "date" }).notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true, mode: "date" }),
    grantedByPersonId: text("granted_by_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [index("authorization_grants_person_domain_idx").on(table.personId, table.domain)]
);

export type PersistenceSchema = {
  people: typeof people;
  consentRecords: typeof consentRecords;
  payments: typeof payments;
  organizations: typeof organizations;
  notifications: typeof notifications;
  notificationDeliveryAttempts: typeof notificationDeliveryAttempts;
  auditLog: typeof auditLog;
  authIdentities: typeof authIdentities;
  authSessions: typeof authSessions;
  authFlows: typeof authFlows;
  rateLimitBuckets: typeof rateLimitBuckets;
  authorizationGrants: typeof authorizationGrants;
};
