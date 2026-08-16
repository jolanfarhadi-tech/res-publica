import { publicContentSource } from "../knowledge-graph/public-source";
import type {
  Entity,
  EntityType,
  KnowledgeGraph,
  Relationship,
} from "../knowledge-graph/types";

export const PUBLIC_API_LOCALES = ["de", "en", "fa"] as const;
export type PublicApiLocale = (typeof PUBLIC_API_LOCALES)[number];

type PublicSourceDto = {
  locale: PublicApiLocale;
  url: string;
};

export type PublicEntityDto = {
  id: string;
  type: EntityType;
  name: string;
  localizedNames: Array<{ locale: PublicApiLocale; name: string }>;
  sources: PublicSourceDto[];
  provenance: {
    deterministic: true;
    humanVerified: true;
    publicOnly: true;
  };
};

export type PublicRelationshipDto = {
  id: string;
  type: Relationship["type"];
  fromEntityId: string;
  toEntityId: string;
  source: PublicSourceDto;
  provenance: {
    deterministic: true;
    humanVerified: true;
    publicOnly: true;
  };
};

export type PublicApiPage<T> = {
  data: T[];
  meta: {
    version: "v1";
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type PublicEntityQuery = {
  locale?: PublicApiLocale;
  type?: EntityType;
  query?: string;
  cursor?: string;
  limit: number;
};

export type PublicRelationshipQuery = {
  locale?: PublicApiLocale;
  cursor?: string;
  limit: number;
};

const provenance = {
  deterministic: true,
  humanVerified: true,
  publicOnly: true,
} as const;

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sourceDtos(entity: Entity): PublicSourceDto[] {
  const unique = new Map<string, PublicSourceDto>();
  for (const source of entity.sources) {
    if (!source.publicEligible) continue;
    const projected = publicContentSource(source.file);
    if (projected) unique.set(`${projected.locale}:${projected.url}`, projected);
  }
  return [...unique.values()].sort((left, right) =>
    compareText(`${left.locale}:${left.url}`, `${right.locale}:${right.url}`)
  );
}

function entityDto(entity: Entity, locale?: PublicApiLocale): PublicEntityDto | null {
  const sources = sourceDtos(entity).filter(
    (source) => !locale || source.locale === locale
  );
  if (sources.length === 0) return null;
  const sourceLocales = new Set(sources.map((source) => source.locale));
  const localizedNames = PUBLIC_API_LOCALES.flatMap((candidateLocale) => {
    if (!sourceLocales.has(candidateLocale)) return [];
    const name =
      entity.aliases.find((alias) => alias.locale === candidateLocale)?.name ??
      entity.canonicalName;
    return [{ locale: candidateLocale, name }];
  });
  const name = locale
    ? localizedNames.find((item) => item.locale === locale)?.name ??
      entity.canonicalName
    : entity.canonicalName;
  return {
    id: entity.id,
    type: entity.type,
    name,
    localizedNames,
    sources,
    provenance,
  };
}

function relationshipId(relationship: Relationship, sourceUrl: string): string {
  return [
    relationship.type,
    relationship.fromEntityId,
    relationship.toEntityId,
    sourceUrl,
  ].join(":");
}

function encodeCursor(
  kind: "entity" | "relationship",
  scope: string,
  value: string
): string {
  return Buffer.from(
    JSON.stringify({ v: 1, kind, scope, after: value }),
    "utf8"
  ).toString("base64url");
}

function decodeCursor(
  kind: "entity" | "relationship",
  scope: string,
  cursor?: string
): string | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      v?: unknown;
      kind?: unknown;
      scope?: unknown;
      after?: unknown;
    };
    if (
      parsed.v !== 1 ||
      parsed.kind !== kind ||
      parsed.scope !== scope ||
      typeof parsed.after !== "string"
    ) {
      throw new Error("invalid");
    }
    return parsed.after;
  } catch {
    throw new PublicApiValidationError("invalid_cursor");
  }
}

function page<T extends { id: string }>(
  kind: "entity" | "relationship",
  scope: string,
  items: T[],
  limit: number,
  cursor?: string
): PublicApiPage<T> {
  const after = decodeCursor(kind, scope, cursor);
  const start = after ? items.findIndex((item) => item.id === after) + 1 : 0;
  if (after && start === 0) throw new PublicApiValidationError("invalid_cursor");
  const selected = items.slice(start, start + limit + 1);
  const hasMore = selected.length > limit;
  const data = selected.slice(0, limit);
  return {
    data,
    meta: {
      version: "v1",
      limit,
      hasMore,
      nextCursor:
        hasMore && data.length > 0
          ? encodeCursor(kind, scope, data[data.length - 1].id)
          : null,
    },
  };
}

export function projectPublicEntities(
  graph: KnowledgeGraph,
  input: PublicEntityQuery
): PublicApiPage<PublicEntityDto> {
  const query = input.query?.trim().toLowerCase() ?? "";
  const scope = JSON.stringify({
    locale: input.locale ?? null,
    type: input.type ?? null,
    query,
  });
  const entities = [...graph.entities.values()]
    .map((entity) => entityDto(entity, input.locale))
    .filter((entity): entity is PublicEntityDto => entity !== null)
    .filter((entity) => !input.type || entity.type === input.type)
    .filter(
      (entity) =>
        !query ||
        entity.name.toLowerCase().includes(query) ||
        entity.localizedNames.some((item) =>
          item.name.toLowerCase().includes(query)
        )
    )
    .sort((left, right) => compareText(left.id, right.id));
  return page("entity", scope, entities, input.limit, input.cursor);
}

export function projectPublicRelationships(
  graph: KnowledgeGraph,
  input: PublicRelationshipQuery
): PublicApiPage<PublicRelationshipDto> {
  const visibleEntityIds = new Set(
    [...graph.entities.values()]
      .map((entity) => entityDto(entity, input.locale))
      .filter((entity): entity is PublicEntityDto => entity !== null)
      .map((entity) => entity.id)
  );
  const relationships = graph.relationships
    .flatMap((relationship): PublicRelationshipDto[] => {
      if (
        !relationship.source.publicEligible ||
        !visibleEntityIds.has(relationship.fromEntityId) ||
        !visibleEntityIds.has(relationship.toEntityId)
      ) {
        return [];
      }
      const source = publicContentSource(relationship.source.file);
      if (!source || (input.locale && source.locale !== input.locale)) return [];
      return [
        {
          id: relationshipId(relationship, source.url),
          type: relationship.type,
          fromEntityId: relationship.fromEntityId,
          toEntityId: relationship.toEntityId,
          source,
          provenance,
        },
      ];
    })
    .sort((left, right) => compareText(left.id, right.id));
  const scope = JSON.stringify({ locale: input.locale ?? null });
  return page("relationship", scope, relationships, input.limit, input.cursor);
}

export class PublicApiValidationError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.name = "PublicApiValidationError";
    this.code = code;
  }
}
