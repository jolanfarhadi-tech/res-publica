import { createPerson } from "../domain/person";
import { grantConsent } from "../domain/consent";
import { createPayment, settlePayment } from "../domain/payment";
import { createOrganization } from "../domain/organization";
import { createNotification } from "../domain/notification";
import { appendEntry } from "../domain/audit-log";
import { createEmptyStore, type LocalDevStore } from "./store";

/**
 * Fixture data — Foundation Build Order Step 4 (`ADR-006`).
 *
 * Deterministic, clearly-fake example instances of the six canonical
 * entities, built through their real factory/invariant functions (never
 * raw object literals), so local development exercises the same validated
 * behavior as production code, not a parallel shortcut.
 */

export function seedFixtures(): LocalDevStore {
  const store = createEmptyStore();

  const alice = createPerson({
    name: "Alice Example",
    contact: { email: "alice@example.test" },
    locale: "de",
  });
  const reza = createPerson({
    name: "Reza Example",
    contact: { email: "reza@example.test" },
    locale: "fa",
  });
  store.people.set(alice.id, alice);
  store.people.set(reza.id, reza);

  const consent = grantConsent(alice.id, "tracking");
  store.consentRecords.set(consent.id, consent);

  const org = createOrganization({ name: "Example Supporter Org", relationshipTypes: ["supporter"] });
  store.organizations.set(org.id, org);

  const payment = createPayment({ payerId: alice.id, amount: 10, currency: "EUR", purpose: "membership-fee" });
  const settled = settlePayment(payment, "fixture-provider-ref");
  store.payments.set(settled.id, settled);

  const notification = createNotification({ recipientPersonId: alice.id, channel: "email", template: "welcome" });
  store.notifications.set(notification.id, notification);

  const auditEntry = appendEntry({ actorPersonId: alice.id, action: "fixture.seeded", target: "local-dev-store" });
  store.auditLog.push(auditEntry);

  return store;
}
