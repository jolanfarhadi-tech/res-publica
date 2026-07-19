import { z } from "zod";
import { EventNotFoundError, getEventCapacity } from "../../../../application/events";
import { getPersistenceRuntime } from "../../../../persistence";

const querySchema = z.object({ eventId: z.string().regex(/^[a-z0-9-]+$/) });

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const parsed = querySchema.safeParse({ eventId: new URL(request.url).searchParams.get("eventId") });
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  const persistence = getPersistenceRuntime();
  if (!persistence) return Response.json({ error: "service_not_configured" }, { status: 503 });
  try {
    const capacity = await getEventCapacity(persistence.db, parsed.data.eventId);
    return Response.json(capacity, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof EventNotFoundError) return Response.json({ error: "event_not_found" }, { status: 404 });
    throw error;
  }
}
