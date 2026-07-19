import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { getAuthRuntime } from "../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import {
  DuplicateEventRegistrationError,
  EventNotFoundError,
  registerAuthenticatedActorForEvent,
} from "../../../../application/events";

const bodySchema = z.object({ eventId: z.string().min(1) });

export async function POST(request: Request) {
  const rejection = rejectUntrustedWriteRequest(request);
  if (rejection) return rejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    const result = await registerAuthenticatedActorForEvent(runtime.db, actor, parsed.data.eventId);
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
    if (error instanceof EventNotFoundError) return Response.json({ error: "event_not_found" }, { status: 404 });
    if (error instanceof DuplicateEventRegistrationError) return Response.json({ error: "already_registered" }, { status: 409 });
    throw error;
  }
}
