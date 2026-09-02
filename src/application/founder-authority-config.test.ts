import { describe, expect, it } from "vitest";
import {
  FounderAuthorityConfigurationError,
  readFounderAuthorityAppointmentEnvironment,
} from "./founder-authority-config";

const validEnvironment = {
  DATABASE_URL: "postgresql://not-printed.example/database",
  FOUNDER_APPOINTMENT_CONFIRMATION:
    "RECORD-EXTERNALLY-APPROVED-FOUNDATIONAL-AUTHORITY",
  FOUNDER_APPROVAL_ISSUER: "https://issuer.example/",
  FOUNDER_APPROVAL_SUBJECT: "approval-subject",
  FOUNDER_APPOINTEE_ISSUER: "https://issuer.example/",
  FOUNDER_APPOINTEE_SUBJECT: "appointee-subject",
  FOUNDER_AUTHORITY: "institution-admin",
  FOUNDER_AUTHORITY_TARGET: "institution-1",
  FOUNDER_APPROVAL_REQUEST_ID: "90000000-0000-4000-8000-000000000001",
};

describe("Founder authority command configuration", () => {
  it("builds an exact appointment only after the explicit confirmation", () => {
    expect(readFounderAuthorityAppointmentEnvironment(validEnvironment)).toEqual({
      databaseUrl: validEnvironment.DATABASE_URL,
      appointment: {
        approvalAuthority: {
          issuer: "https://issuer.example/",
          subject: "approval-subject",
        },
        appointee: {
          issuer: "https://issuer.example/",
          subject: "appointee-subject",
        },
        authority: "institution-admin",
        target: "institution-1",
        validUntil: null,
        approvalRequestId: "90000000-0000-4000-8000-000000000001",
      },
    });
  });

  it.each([
    ["confirmation", { ...validEnvironment, FOUNDER_APPOINTMENT_CONFIRMATION: undefined }],
    ["request", { ...validEnvironment, FOUNDER_APPROVAL_REQUEST_ID: "not-a-uuid" }],
    ["authority", { ...validEnvironment, FOUNDER_AUTHORITY: "admin" }],
    ["target", { ...validEnvironment, FOUNDER_AUTHORITY_TARGET: "  " }],
    ["database", { ...validEnvironment, DATABASE_URL: undefined }],
  ])("fails closed for invalid %s configuration", (_field, environment) => {
    expect(() => readFounderAuthorityAppointmentEnvironment(environment))
      .toThrow(FounderAuthorityConfigurationError);
  });
});
