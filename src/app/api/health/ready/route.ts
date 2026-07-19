import { sql } from "drizzle-orm";
import { getPersistenceRuntime } from "../../../../persistence";

export const dynamic = "force-dynamic";

export async function GET() {
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
    return Response.json(
      { status: "not_ready", dependency: "database", configured: true },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}
