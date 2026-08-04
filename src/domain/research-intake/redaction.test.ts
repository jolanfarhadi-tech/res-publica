import { describe, expect, it } from "vitest";
import {
  containsGenericDirectIdentifier,
  redactSubmitterIdentity,
} from "./redaction";

const identity = {
  givenName: "Mina",
  familyName: "Rahimi",
  email: "mina.rahimi@example.org",
  phone: "+49 170 1234567",
  addressLines: ["Mainzer Landstraße 50", "60329 Frankfurt"],
  accountIdentifiers: ["auth0-user-123456", "wallet_internal_987654"],
};

describe("context-sensitive submitter redaction", () => {
  it("removes the submitter identity while preserving institutional evidence", () => {
    const text = [
      "Ich, Mina Rahimi, war in der Klinik Mina Rahimi Stiftung.",
      "Meine E-Mail ist mina.rahimi@example.org und meine Nummer +49 170 1234567.",
      "Der Vorgang betraf die Abteilung Patientenschutz der Universität Frankfurt.",
      "Meine Anschrift ist Mainzer Landstraße 50, 60329 Frankfurt.",
      "Konto auth0-user-123456.",
    ].join(" ");
    const result = redactSubmitterIdentity(text, identity);

    expect(result.sanitizedText).not.toContain("Ich, Mina Rahimi,");
    expect(result.sanitizedText).not.toContain(identity.email);
    expect(result.sanitizedText).not.toContain(identity.phone);
    expect(result.sanitizedText).not.toContain(identity.addressLines[0]);
    expect(result.sanitizedText).not.toContain(identity.accountIdentifiers[0]);
    expect(result.sanitizedText).toContain("Klinik Mina Rahimi Stiftung");
    expect(result.sanitizedText).toContain("Abteilung Patientenschutz");
    expect(result.sanitizedText).toContain("Universität Frankfurt");
    expect(result.redactions.map((item) => item.category)).toEqual(expect.arrayContaining([
      "SUBMITTER_NAME",
      "SUBMITTER_EMAIL",
      "SUBMITTER_PHONE",
      "SUBMITTER_ADDRESS",
      "SUBMITTER_ACCOUNT_IDENTIFIER",
    ]));
  });

  it("supports Persian identity removal without removing institutions", () => {
    const result = redactSubmitterIdentity(
      "من مینا رحیمی هستم و تجربه من در دانشگاه تهران رخ داد. ایمیل mina.rahimi@example.org است.",
      { ...identity, givenName: "مینا", familyName: "رحیمی" }
    );
    expect(result.sanitizedText).not.toContain("مینا رحیمی هستم");
    expect(result.sanitizedText).toContain("دانشگاه تهران");
  });

  it("rejects generic direct identifiers at the anonymous server boundary", () => {
    expect(containsGenericDirectIdentifier("Contact me at person@example.org")).toBe(true);
    expect(containsGenericDirectIdentifier("wallet:abc123456789")).toBe(true);
    expect(containsGenericDirectIdentifier("Universität Frankfurt, Referat Forschung")).toBe(false);
  });
});
