import { describe, it, expect } from "vitest";
import { createLocalProvider } from "./providers/local-provider";
import { queryAILayer } from "./query";
import { createLedger, totalSpend } from "./cost-governance";
import type { KnowledgeGraph } from "../knowledge-graph/types";
import type { AIProvider } from "./types";

function graphWithEntity(): KnowledgeGraph {
  return {
    entities: new Map([
      [
        "e1",
        {
          id: "e1",
          domain: "civic",
          type: "topic",
          canonicalName: "Participation Impact",
          aliases: [],
          sources: [{ file: "src/content/de/pages/research.mdx", locale: "de" }],
        },
      ],
    ]),
    relationships: [],
  };
}

describe("Local Provider (Knowledge Graph keyword search)", () => {
  it("answers with a citation when the Knowledge Graph has a matching entity", () => {
    const provider = createLocalProvider(graphWithEntity());
    const result = provider.query("participation");
    expect(result.refused).toBe(false);
    expect(result.citations).toContain("src/content/de/pages/research.mdx");
  });

  it("refuses when nothing in the Knowledge Graph matches", () => {
    const provider = createLocalProvider(graphWithEntity());
    const result = provider.query("something unrelated entirely");
    expect(result.refused).toBe(true);
    expect(result.citations).toEqual([]);
  });
});

describe("queryAILayer — citation-or-refuse enforcement", () => {
  it("forces refusal if a provider claims success with no citations", () => {
    const dishonestProvider: AIProvider = {
      name: "dishonest-test-provider",
      estimatedCostPerQuery: 0,
      query: () => ({ answer: "I know this for sure!", citations: [], refused: false }),
    };
    const { result } = queryAILayer(dishonestProvider, "anything", createLedger(100), { domain: "civic", useCaseId: "grounded-search" });
    expect(result.refused).toBe(true);
  });

  it("passes through a properly-cited answer unmodified", () => {
    const provider = createLocalProvider(graphWithEntity());
    const { result } = queryAILayer(provider, "participation", createLedger(100), { domain: "civic", useCaseId: "grounded-search" });
    expect(result.refused).toBe(false);
    expect(result.citations.length).toBeGreaterThan(0);
  });
});

describe("Cost Governance Ledger", () => {
  it("tracks spend across queries", () => {
    const paidProvider: AIProvider = {
      name: "paid-test-provider",
      estimatedCostPerQuery: 5,
      query: () => ({ answer: "x", citations: ["c"], refused: false }),
    };
    let ledger = createLedger(100);
    ({ ledger } = queryAILayer(paidProvider, "q1", ledger, { domain: "civic", useCaseId: "grounded-search" }));
    ({ ledger } = queryAILayer(paidProvider, "q2", ledger, { domain: "civic", useCaseId: "grounded-search" }));
    expect(totalSpend(ledger)).toBe(10);
  });

  it("falls back to refusal once the monthly spend ceiling is reached, never exceeding it", () => {
    const paidProvider: AIProvider = {
      name: "paid-test-provider",
      estimatedCostPerQuery: 60,
      query: () => ({ answer: "x", citations: ["c"], refused: false }),
    };
    let ledger = createLedger(100);
    ({ ledger } = queryAILayer(paidProvider, "q1", ledger, { domain: "civic", useCaseId: "grounded-search" })); // spend: 60
    const second = queryAILayer(paidProvider, "q2", ledger, { domain: "civic", useCaseId: "grounded-search" }); // would be 120 — over ceiling
    expect(second.result.refused).toBe(true);
    expect(totalSpend(second.ledger)).toBe(60); // unchanged — no unbounded bill
  });

  it("records the owning domain and use case in the single ledger", () => {
    const provider = createLocalProvider(graphWithEntity());
    const { ledger } = queryAILayer(provider, "participation", createLedger(100), {
      domain: "civic",
      useCaseId: "grounded-search",
    });
    expect(ledger.entries[0]).toMatchObject({ domain: "civic", useCaseId: "grounded-search" });
  });
});
