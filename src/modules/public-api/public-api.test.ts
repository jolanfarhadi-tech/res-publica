import { describe, expect, it } from "vitest";
import type { KnowledgeGraph } from "../knowledge-graph/types";
import { publicContentSource } from "../knowledge-graph/public-source";
import { publicApiJson } from "./http";
import {
  PublicApiValidationError,
  projectPublicEntities,
  projectPublicRelationships,
} from "./projection";

function graph(): KnowledgeGraph {
  return {
    entities: new Map([
      [
        "harm",
        {
          id: "harm",
          domain: "civic",
          type: "topic",
          canonicalName: "HARM",
          aliases: [
            { locale: "de", name: "HARM-Forschung" },
            { locale: "en", name: "HARM research" },
            { locale: "fa", name: "پژوهش هارم" },
          ],
          sources: [
            source("de", "projects", "harm-research"),
            source("en", "projects", "harm-research"),
            source("fa", "projects", "harm-research"),
          ],
        },
      ],
      [
        "participation",
        {
          id: "participation",
          domain: "civic",
          type: "topic",
          canonicalName: "Participation",
          aliases: [
            { locale: "de", name: "Beteiligung" },
            { locale: "en", name: "Participation" },
            { locale: "fa", name: "مشارکت" },
          ],
          sources: [
            source("de", "pages", "research"),
            source("en", "pages", "research"),
            source("fa", "pages", "research"),
          ],
        },
      ],
      [
        "internal-only",
        {
          id: "internal-only",
          domain: "civic",
          type: "topic",
          canonicalName: "Internal",
          aliases: [],
          sources: [
            {
              file: "docs/internal/private.md",
              locale: "de",
              canonicalSource: "private",
              publicEligible: true,
            },
          ],
        },
      ],
    ]),
    relationships: [
      {
        domain: "civic",
        type: "co-occurs",
        fromEntityId: "harm",
        toEntityId: "participation",
        source: source("fa", "projects", "harm-research"),
      },
    ],
  };
}

function source(locale: "de" | "en" | "fa", section: string, slug: string) {
  return {
    file: `src/content/${locale}/${section}/${slug}.mdx`,
    locale,
    canonicalSource: `docs/source/${slug}.md`,
    publicEligible: true,
  };
}

describe("Public API v1 projection", () => {
  it.each([
    ["de", "HARM-Forschung", "/de/projects/harm-research"],
    ["en", "HARM research", "/en/projects/harm-research"],
    ["fa", "پژوهش هارم", "/fa/projects/harm-research"],
  ] as const)("projects the %s locale without leaking internal fields", (locale, name, url) => {
    const page = projectPublicEntities(graph(), { locale, limit: 25 });
    const entity = page.data.find((item) => item.id === "harm");

    expect(entity).toMatchObject({
      id: "harm",
      name,
      sources: [{ locale, url }],
      provenance: {
        deterministic: true,
        humanVerified: true,
        publicOnly: true,
      },
    });
    expect(page.data.some((item) => item.id === "internal-only")).toBe(false);
    const serialized = JSON.stringify(page);
    expect(serialized).not.toContain("src/content");
    expect(serialized).not.toContain("canonicalSource");
    expect(serialized).not.toContain("publicEligible");
    expect(serialized).not.toContain('"domain"');
  });

  it("uses an opaque stable cursor without offset pagination", () => {
    const first = projectPublicEntities(graph(), { limit: 1 });
    expect(first.data).toHaveLength(1);
    expect(first.meta.hasMore).toBe(true);
    expect(first.meta.nextCursor).toMatch(/^[A-Za-z0-9_-]+$/);

    const second = projectPublicEntities(graph(), {
      limit: 1,
      cursor: first.meta.nextCursor!,
    });
    expect(second.data).toHaveLength(1);
    expect(second.data[0].id).not.toBe(first.data[0].id);
  });

  it("rejects malformed or cross-resource cursors", () => {
    expect(() =>
      projectPublicEntities(graph(), { limit: 1, cursor: "not-a-cursor" })
    ).toThrow(PublicApiValidationError);
    const entityCursor = projectPublicEntities(graph(), { limit: 1 }).meta
      .nextCursor!;
    expect(() =>
      projectPublicRelationships(graph(), {
        limit: 1,
        cursor: entityCursor,
      })
    ).toThrow(PublicApiValidationError);
    expect(() =>
      projectPublicEntities(graph(), {
        locale: "fa",
        limit: 1,
        cursor: entityCursor,
      })
    ).toThrow(PublicApiValidationError);
  });

  it("projects only relationships whose source and endpoints exist in the locale", () => {
    expect(projectPublicRelationships(graph(), { locale: "de", limit: 25 }).data).toEqual([]);
    expect(projectPublicRelationships(graph(), { locale: "fa", limit: 25 }).data).toEqual([
      expect.objectContaining({
        type: "co-occurs",
        fromEntityId: "harm",
        toEntityId: "participation",
        source: { locale: "fa", url: "/fa/projects/harm-research" },
      }),
    ]);
  });

  it("maps only approved public content paths", () => {
    expect(publicContentSource("src\\content\\de\\pages\\about.mdx")).toEqual({
      locale: "de",
      url: "/de/about",
    });
    expect(publicContentSource("docs/private.md")).toBeNull();
  });

  it("returns deterministic ETags and honors conditional requests", async () => {
    const request = new Request("https://respublica-ev.de/api/public/v1");
    const first = publicApiJson(request, { data: [{ id: "harm" }] });
    const etag = first.headers.get("etag");
    expect(etag).toMatch(/^"[A-Za-z0-9_-]+"$/);

    const conditional = publicApiJson(
      new Request(request.url, { headers: { "if-none-match": etag! } }),
      { data: [{ id: "harm" }] }
    );
    expect(conditional.status).toBe(304);
    expect(await conditional.text()).toBe("");
  });
});
