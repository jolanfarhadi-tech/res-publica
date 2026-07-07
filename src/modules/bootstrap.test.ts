import { describe, it, expect } from "vitest";
import { bootstrapModules } from "./bootstrap";
import { getModule } from "./registry";

describe("Module bootstrap", () => {
  it("registers every implemented module without collision", () => {
    bootstrapModules();
    expect(getModule("knowledge-graph")).toBeDefined();
    expect(getModule("ai-layer")).toBeDefined();
    expect(getModule("publishing")).toBeDefined();
    expect(getModule("community")).toBeDefined();
    expect(getModule("membership")).toBeDefined();
    expect(getModule("events")).toBeDefined();
    expect(getModule("dashboard")).toBeDefined();
    expect(getModule("crm")).toBeDefined();
    expect(getModule("analytics")).toBeDefined();
  });
});
