/**
 * Analytics — Foundation Build Order Step 5, MVP module #9 (final MVP module).
 * "The single, authoritative internal measurement surface for civic
 * effect... explicitly excluding any attention or engagement metric, by
 * design, not by oversight" (`mvp-module-blueprint.md`).
 *
 * No independent AI Usage Record or Spend Ledger exists here — Analytics
 * reads and aggregates `ai-layer`'s own `CostGovernanceLedger` directly
 * (per the spec's own explicit correction).
 */

export type MetricSnapshot = {
  id: string;
  languageCommunity: string;
  participationCount: number;
  subscriberCount: number;
  timestamp: Date;
};

export type FunnelStageEvent = {
  id: string;
  stage: string;
  count: number;
};
