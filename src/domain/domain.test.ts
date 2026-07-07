import { describe, it, expect } from "vitest";
import { createPerson } from "./person";
import { grantConsent, revokeConsent, hasActiveConsent } from "./consent";
import { createPayment, settlePayment, refundPayment } from "./payment";
import { createOrganization, addRelationshipType } from "./organization";
import { createNotification, markSent } from "./notification";
import { appendEntry, pseudonymizeEntry, AUDIT_LOG_ERASURE_LEGALLY_APPROVED } from "./audit-log";

describe("Person", () => {
  it("defaults rtlPreference to true for Farsi locale", () => {
    const p = createPerson({ name: "Test", contact: { email: "t@example.com" }, locale: "fa" });
    expect(p.rtlPreference).toBe(true);
  });

  it("respects an explicit rtlPreference override for a non-Farsi locale", () => {
    const p = createPerson({ name: "Test2", contact: { email: "t2@example.com" }, locale: "de", rtlPreference: true });
    expect(p.rtlPreference).toBe(true);
  });
});

describe("ConsentRecord", () => {
  it("is purpose-scoped — a grant for one purpose does not imply another", () => {
    const person = createPerson({ name: "P", contact: { email: "p@example.com" }, locale: "de" });
    const consent = grantConsent(person.id, "tracking");
    expect(hasActiveConsent([consent], person.id, "tracking")).toBe(true);
    expect(hasActiveConsent([consent], person.id, "invitations")).toBe(false);
  });

  it("is revocable, and a revoked grant is no longer active", () => {
    const person = createPerson({ name: "P", contact: { email: "p@example.com" }, locale: "de" });
    const revoked = revokeConsent(grantConsent(person.id, "tracking"));
    expect(hasActiveConsent([revoked], person.id, "tracking")).toBe(false);
  });

  it("throws when revoking an already-revoked record", () => {
    const person = createPerson({ name: "P", contact: { email: "p@example.com" }, locale: "de" });
    const revoked = revokeConsent(grantConsent(person.id, "tracking"));
    expect(() => revokeConsent(revoked)).toThrow();
  });
});

describe("Payment", () => {
  it("is created as pending and becomes immutable once settled", () => {
    const person = createPerson({ name: "P", contact: { email: "p@example.com" }, locale: "de" });
    const payment = createPayment({ payerId: person.id, amount: 25, currency: "EUR", purpose: "membership-fee" });
    expect(payment.status).toBe("pending");
    const settled = settlePayment(payment, "ref-123");
    expect(settled.status).toBe("settled");
    expect(Object.isFrozen(settled)).toBe(true);
    expect(() => settlePayment(settled, "again")).toThrow();
  });

  it("can be refunded after settlement", () => {
    const person = createPerson({ name: "P", contact: { email: "p@example.com" }, locale: "de" });
    const settled = settlePayment(
      createPayment({ payerId: person.id, amount: 10, currency: "EUR", purpose: "donation" }),
      "ref"
    );
    expect(refundPayment(settled).status).toBe("refunded");
  });
});

describe("Organization", () => {
  it("supports overlapping relationship types simultaneously", () => {
    let org = createOrganization({ name: "Org", relationshipTypes: ["supporter"] });
    org = addRelationshipType(org, "partner");
    expect(org.relationshipTypes).toEqual(["supporter", "partner"]);
  });
});

describe("Notification", () => {
  it("transitions from pending to sent, setting sentAt", () => {
    const person = createPerson({ name: "P", contact: { email: "p@example.com" }, locale: "de" });
    const n = markSent(createNotification({ recipientPersonId: person.id, channel: "email", template: "welcome" }));
    expect(n.status).toBe("sent");
    expect(n.sentAt).not.toBeNull();
  });
});

describe("AuditLog", () => {
  it("is append-only — entries are frozen on creation", () => {
    const person = createPerson({ name: "P", contact: { email: "p@example.com" }, locale: "de" });
    const entry = appendEntry({ actorPersonId: person.id, action: "test.action", target: person.id });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(entry.pseudonymized).toBe(false);
  });

  it("refuses pseudonymization while erasure is not legally approved", () => {
    expect(AUDIT_LOG_ERASURE_LEGALLY_APPROVED).toBe(false);
    const person = createPerson({ name: "P", contact: { email: "p@example.com" }, locale: "de" });
    const entry = appendEntry({ actorPersonId: person.id, action: "test.action", target: person.id });
    expect(() => pseudonymizeEntry(entry)).toThrow(/legal\/data-protection sign-off/);
  });
});
