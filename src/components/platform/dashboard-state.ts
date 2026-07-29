import type { getSelfDashboard } from "../../application/dashboard";

export type DashboardPayload = Awaited<ReturnType<typeof getSelfDashboard>>;

export type DashboardViewState =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "unavailable" }
  | { kind: "error" }
  | { kind: "ready"; dashboard: DashboardPayload };

export async function dashboardStateFromResponse(
  response: Response
): Promise<DashboardViewState> {
  if (response.ok) {
    return {
      kind: "ready",
      dashboard: (await response.json()) as DashboardPayload,
    };
  }
  if (response.status === 401) return { kind: "anonymous" };
  if (response.status === 503) return { kind: "unavailable" };
  return { kind: "error" };
}
