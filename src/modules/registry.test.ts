import { describe, it, expect } from "vitest";
import { registerModule, getRegisteredModules, getModule, ManifestValidationError } from "./registry";

// Each test uses unique module/table names to avoid cross-test collisions,
// since the registry is a module-level singleton (matching how it will
// actually be used — one registry per running process).

describe("Module Registry", () => {
  it("registers a well-formed manifest", () => {
    const m = registerModule({
      moduleName: "test-registry-community",
      entities: ["Person", "ConsentRecord"],
      databaseTables: ["test_registry_community_members"],
      apiRoutes: ["/api/test-registry-community/ladder-stage"],
      dashboardContribution: null,
      aiLayerCapabilities: [],
    });
    expect(m.moduleName).toBe("test-registry-community");
    expect(getModule("test-registry-community")).toBeDefined();
  });

  it("rejects a second module claiming an already-owned table", () => {
    registerModule({
      moduleName: "test-registry-owner",
      entities: [],
      databaseTables: ["test_registry_shared_table"],
      apiRoutes: [],
      dashboardContribution: null,
      aiLayerCapabilities: [],
    });
    expect(() =>
      registerModule({
        moduleName: "test-registry-claimant",
        entities: [],
        databaseTables: ["test_registry_shared_table"],
        apiRoutes: [],
        dashboardContribution: null,
        aiLayerCapabilities: [],
      })
    ).toThrow(ManifestValidationError);
  });

  it("rejects registering the same module name twice", () => {
    registerModule({
      moduleName: "test-registry-duplicate",
      entities: [],
      databaseTables: ["test_registry_duplicate_table"],
      apiRoutes: [],
      dashboardContribution: null,
      aiLayerCapabilities: [],
    });
    expect(() =>
      registerModule({
        moduleName: "test-registry-duplicate",
        entities: [],
        databaseTables: ["test_registry_duplicate_table_2"],
        apiRoutes: [],
        dashboardContribution: null,
        aiLayerCapabilities: [],
      })
    ).toThrow(ManifestValidationError);
  });

  it("rejects a manifest referencing a nonexistent canonical entity", () => {
    expect(() =>
      registerModule({
        moduleName: "test-registry-invalid-entity",
        // @ts-expect-error — intentionally invalid entity name
        entities: ["NotACanonicalEntity"],
        databaseTables: ["test_registry_invalid_entity_table"],
        apiRoutes: [],
        dashboardContribution: null,
        aiLayerCapabilities: [],
      })
    ).toThrow();
  });

  it("preserves the optional dashboardContribution field", () => {
    const m = registerModule({
      moduleName: "test-registry-membership",
      entities: ["Person", "Payment"],
      databaseTables: ["test_registry_membership_table"],
      apiRoutes: [],
      dashboardContribution: "membership-summary",
      aiLayerCapabilities: [],
    });
    expect(m.dashboardContribution).toBe("membership-summary");
  });

  it("lists all registered modules", () => {
    const before = getRegisteredModules().length;
    registerModule({
      moduleName: "test-registry-list-check",
      entities: [],
      databaseTables: ["test_registry_list_check_table"],
      apiRoutes: [],
      dashboardContribution: null,
      aiLayerCapabilities: [],
    });
    expect(getRegisteredModules().length).toBe(before + 1);
  });
});
