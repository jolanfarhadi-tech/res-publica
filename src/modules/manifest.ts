import { z } from "zod";

/**
 * Module Manifest — the contract every module (present and future) exposes,
 * per `ADR-003`: "which Core Domain Model entities it reads or writes, what
 * new database tables it owns, what API routes it registers, what (if any)
 * Dashboard module-manifest entry it contributes, and what AI Layer
 * capabilities it consumes." Core Platform's role is limited to reading
 * these manifests at build/deploy time — it contains no module-specific
 * logic of its own.
 *
 * Governing documents: `architecture/adr/ADR-003-plugin-architecture.md`;
 * `architecture/adr/ADR-002-domain-model.md` (the entities a manifest may
 * reference).
 *
 * Scope note: this is the contract and its structural shape only. No real
 * module's manifest is registered here — that is Foundation Build Order
 * Step 5. Declaring a table, route, or AI capability here is metadata a
 * future Backend/API/AI Layer implementation will act on; nothing is
 * created or wired by this file itself.
 */

/** The six canonical entities approved by `ADR-002` and implemented in `src/domain/`. */
export const CANONICAL_ENTITY_NAMES = [
  "Person",
  "ConsentRecord",
  "Payment",
  "Organization",
  "Notification",
  "AuditLog",
] as const;

export type CanonicalEntityName = (typeof CANONICAL_ENTITY_NAMES)[number];

export const moduleManifestSchema = z.object({
  /** Unique module identifier, e.g. "community", "membership". */
  moduleName: z.string().min(1),
  /** Core Domain Model entities this module reads or writes. */
  entities: z.array(z.enum(CANONICAL_ENTITY_NAMES)),
  /** Database tables this module owns — declarative only; no table is created here. */
  databaseTables: z.array(z.string().min(1)),
  /** API routes this module registers — declarative only; nothing is wired here. */
  apiRoutes: z.array(z.string().min(1)),
  /** The Dashboard module-manifest entry this module contributes, if any. */
  dashboardContribution: z.string().nullable(),
  /** AI Layer capabilities this module consumes, if any. */
  aiLayerCapabilities: z.array(z.string()),
});

export type ModuleManifest = z.infer<typeof moduleManifestSchema>;
