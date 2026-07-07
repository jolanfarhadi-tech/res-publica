/**
 * Authentication/Identity extension point — deliberately NOT implemented.
 *
 * `ADR-027` (Identity / Authentication / Authorization) is an unresolved
 * constitutional stub; this module does not define, implement, or own
 * Authentication, per that ADR's own scope and this session's standing
 * execution boundary.
 *
 * `Member.personId` already references the real, existing `Person` entity
 * (`domain/person`, built in Foundation Build Order Step 1) — Person's
 * identity record is independent of Authentication (verifying *who* is
 * making a request), which is `ADR-027`'s separate, unresolved concern.
 * This interface exists only so a future API/session layer has a stable
 * shape to resolve a verified actor into a `personId` before calling into
 * Membership's domain functions. Membership never inspects, verifies, or
 * interprets how that resolution happened — it only ever consumes the
 * resulting `personId`, exactly as it already does throughout this module.
 */

export type AuthenticatedActor = {
  personId: string;
};

/**
 * A future Auth system would implement this to resolve a request's
 * session/token into an `AuthenticatedActor`. No implementation exists
 * here — activating one is a configuration/wiring decision for a future
 * Backend/API layer, never something this module performs itself.
 */
export type ActorResolver = {
  resolve(request: unknown): AuthenticatedActor | null;
};
