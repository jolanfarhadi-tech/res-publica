import { sql } from "drizzle-orm";
import { getPersistenceRuntime } from "../../../../persistence";
import {
  logOperationalFailure,
  withRequestContext,
} from "../../../../platform/request-context";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return withRequestContext(request, async ({ requestId }) => {
    const persistence = getPersistenceRuntime();
    if (!persistence) {
      return Response.json(
        { status: "not_ready", dependency: "database", configured: false },
        { status: 503, headers: { "cache-control": "no-store" } }
      );
    }

    try {
      await persistence.db.execute(sql`select 1`);
      return Response.json(
        { status: "ready" },
        { headers: { "cache-control": "no-store" } }
      );
    } catch {
      logOperationalFailure({
        event: "health.database_unavailable",
        dependency: "database",
        requestId,
        status: 503,
      });
      return Response.json(
        { status: "not_ready", dependency: "database", configured: true },
        { status: 503, headers: { "cache-control": "no-store" } }
      );
    }
  });
}
