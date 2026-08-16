import { describe, expect, it } from "vitest";
import { auditSupplyChain } from "./check-supply-chain.mjs";

describe("software supply-chain gate", () => {
  it("keeps the checked-in runtime, lockfile and workflows inside the reviewed policy", () => {
    expect(auditSupplyChain(process.cwd())).toEqual([]);
  });
});
