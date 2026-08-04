import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { authorizeResearchVerifierClient } from "./research-verifier-access";

const projectDigest = "a".repeat(64);
const token = "synthetic-project-token";
const environment = {
  RESEARCH_VERIFIER_CLIENTS_JSON: JSON.stringify({
    [projectDigest]: {
      tokenHash: createHash("sha256").update(token).digest("hex"),
      allowedOrigin: "https://research.example.invalid",
      audience: "https://verifier.example.invalid/present",
    },
  }),
};

function request(origin = "https://research.example.invalid", bearer = token) {
  return new Request("https://respublica-ev.de/api/research/verifier/challenge", {
    method: "POST",
    headers: { origin, authorization: `Bearer ${bearer}` },
  });
}

describe("research verifier client boundary", () => {
  it("authorizes only the exact project, token hash, and origin", () => {
    expect(authorizeResearchVerifierClient(request(), projectDigest, environment)).toMatchObject({
      projectDigest,
      audience: "https://verifier.example.invalid/present",
    });
    expect(authorizeResearchVerifierClient(request("https://attacker.example.invalid"), projectDigest, environment)).toBeNull();
    expect(authorizeResearchVerifierClient(request(undefined, "wrong-token"), projectDigest, environment)).toBeNull();
    expect(authorizeResearchVerifierClient(request(), "b".repeat(64), environment)).toBeNull();
  });

  it("fails closed for malformed client configuration", () => {
    expect(authorizeResearchVerifierClient(request(), projectDigest, {
      RESEARCH_VERIFIER_CLIENTS_JSON: "not-json",
    })).toBeNull();
  });
});
