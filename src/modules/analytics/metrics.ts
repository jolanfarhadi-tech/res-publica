import { createId } from "../../domain/shared";
import type { Person } from "../../domain/person";
import type { LadderStageTransition } from "../community/types";
import type { FunnelStageEvent, MetricSnapshot } from "./types";

/**
 * Metrics Query / Funnel Stage Report — real integration: derives
 * participation-per-subscriber from real `Person` locales and real
 * Community `LadderStageTransition` records. Deliberately excludes any
 * attention/engagement field (no duration, no click-through, no
 * time-on-site) — an explicit design boundary, not an omission.
 */
export function computeParticipationPerSubscriber(
  people: readonly Person[],
  transitions: readonly LadderStageTransition[]
): MetricSnapshot[] {
  const byLocale = new Map<string, number>();
  for (const p of people) {
    byLocale.set(p.locale, (byLocale.get(p.locale) ?? 0) + 1);
  }
  return [...byLocale.entries()].map(([languageCommunity, subscriberCount]) => ({
    id: createId(),
    languageCommunity,
    participationCount: transitions.length,
    subscriberCount,
    timestamp: new Date(),
  }));
}

export function computeFunnelStageEvents(transitions: readonly LadderStageTransition[]): FunnelStageEvent[] {
  const counts = new Map<string, number>();
  for (const t of transitions) {
    counts.set(t.toStage, (counts.get(t.toStage) ?? 0) + 1);
  }
  return [...counts.entries()].map(([stage, count]) => ({ id: createId(), stage, count }));
}
