import { describe, expect, it } from "vitest";
import {
  checkProcessingInventory,
  loadProcessingInventory,
  validateProcessingInventory,
} from "./check-processing-inventory.mjs";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

describe("implementation-backed processing inventory", () => {
  it("covers every current PostgreSQL table and synchronized human activity", () => {
    expect(checkProcessingInventory()).toEqual({ activities: 20, tables: 98 });
  });

  it("rejects invented legal conclusions and retention periods", () => {
    const inventory = clone(loadProcessingInventory());
    inventory.activities[0].legalBasis = "invented";
    inventory.activities[1].retentionPeriod = "invented";
    expect(validateProcessingInventory(inventory)).toEqual(
      expect.arrayContaining([
        "public-delivery.legalBasis must remain null until approval",
        "oidc-authentication.retentionPeriod must remain null until approval",
      ])
    );
  });

  it("fails when a schema store or closed research gate drifts", () => {
    const inventory = clone(loadProcessingInventory());
    inventory.activities.forEach((activity) => {
      activity.stores = activity.stores.filter(
        (store) => store !== "postgres:auth_sessions"
      );
    });
    const research = inventory.activities.find(
      (activity) => activity.id === "research-participation-and-wallet"
    );
    research.realDataPermitted = true;
    expect(validateProcessingInventory(inventory)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("auth_sessions"),
        "research real-data gate must remain explicit and closed",
      ])
    );
  });
});
