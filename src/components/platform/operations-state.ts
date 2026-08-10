import type {
  getMembershipApplicationForOperations,
  getOperationsOverview,
} from "../../application/operations-console";
import type { getPublishingWorkspace } from "../../application/publishing-workspace";

export type OperationsOverviewPayload = Awaited<
  ReturnType<typeof getOperationsOverview>
>;
export type OperationsMembershipDetail = Awaited<
  ReturnType<typeof getMembershipApplicationForOperations>
>;
export type PublishingWorkspacePayload = Awaited<
  ReturnType<typeof getPublishingWorkspace>
>;

export type OperationsViewState =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "mfa-required" }
  | { kind: "forbidden" }
  | { kind: "unavailable" }
  | { kind: "error" }
  | { kind: "ready"; overview: OperationsOverviewPayload };

export async function operationsStateFromResponse(
  response: Response
): Promise<OperationsViewState> {
  if (response.ok) {
    return {
      kind: "ready",
      overview: (await response.json()) as OperationsOverviewPayload,
    };
  }
  if (response.status === 401) return { kind: "anonymous" };
  if (response.status === 503) return { kind: "unavailable" };
  if (response.status === 403) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    return payload?.error === "mfa_required"
      ? { kind: "mfa-required" }
      : { kind: "forbidden" };
  }
  return { kind: "error" };
}
