/**
 * Shared primitives for the Core Domain Model (`ADR-002`;
 * `brain/DOMAIN/CORE_DOMAIN_MODEL.md` §3a, LOCKED — referenced, not modified).
 *
 * Kept minimal: an id type and generator, reused by every canonical entity
 * below rather than each module reimplementing its own id scheme.
 */

export type EntityId = string;

export function createId(): EntityId {
  return crypto.randomUUID();
}
