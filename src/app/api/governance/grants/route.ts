import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { getAuthRuntime } from "../../../../auth/runtime";
import { grantGovernanceRole, GovernanceGrantError, revokeGovernanceRole } from "../../../../application/governance-authority";

const operationalRole = z.enum([
  "intake-moderator", "validation-officer", "evidence-reviewer", "hearing-moderator",
  "quality-reviewer", "scientific-reviewer", "repair-coordinator",
]);
const grantSchema = z.object({
  granteePersonId: z.string().min(1), institutionId: z.string().min(1), role: operationalRole,
  validUntil: z.string().datetime().nullable().default(null),
});
const revokeSchema = z.object({ grantId: z.string().min(1), institutionId: z.string().min(1) });

async function context(request: Request) {
  const rejection = rejectUntrustedWriteRequest(request);
  if (rejection) return { response: rejection } as const;
  const runtime = getAuthRuntime();
  if (!runtime) return { response: Response.json({ error: "service_not_configured" }, { status: 503 }) } as const;
  return { runtime, actor: await createActorResolver(runtime.db).resolve(request) } as const;
}

export async function POST(request: Request) {
  const ctx = await context(request);
  if ("response" in ctx) return ctx.response;
  const parsed = grantSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const grant = await grantGovernanceRole(ctx.runtime.db, ctx.actor, {
      ...parsed.data, validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
    });
    return Response.json({ grant }, { status: 201 });
  } catch (error) { return governanceError(error); }
}

export async function DELETE(request: Request) {
  const ctx = await context(request);
  if ("response" in ctx) return ctx.response;
  const parsed = revokeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    return Response.json({ grant: await revokeGovernanceRole(ctx.runtime.db, ctx.actor, parsed.data) });
  } catch (error) { return governanceError(error); }
}

function governanceError(error: unknown): Response {
  if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
  if (error instanceof GovernanceGrantError) {
    const status = error.code === "grant_not_found" || error.code === "grantee_not_found" ? 404 : 403;
    return Response.json({ error: error.code }, { status });
  }
  throw error;
}
