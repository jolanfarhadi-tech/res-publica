import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { getAuthRuntime } from "../../../../auth/runtime";
import { addHarmEvidence, HarmGovernanceError, submitCaseForValidation } from "../../../../application/harm-governance";

const addSchema = z.object({ caseId: z.string().min(1), description: z.string().min(1), source: z.string().min(1), mediaType: z.string().min(1), storageReference: z.string().min(1) });
const submitSchema = z.object({ caseId: z.string().min(1) });

export async function POST(request: Request) {
  return execute(request, addSchema, (db, actor, input) => addHarmEvidence(db, actor, input), 201);
}
export async function PATCH(request: Request) {
  return execute(request, submitSchema, (db, actor, input) => submitCaseForValidation(db, actor, input.caseId), 200);
}

async function execute<T extends z.ZodTypeAny>(request: Request, schema: T, operation: (db: NonNullable<ReturnType<typeof getAuthRuntime>>["db"], actor: Awaited<ReturnType<ReturnType<typeof createActorResolver>["resolve"]>>, input: z.infer<T>) => Promise<unknown>, status: number) {
  const rejection = rejectUntrustedWriteRequest(request);
  if (rejection) return rejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    return Response.json({ result: await operation(runtime.db, actor, parsed.data) }, { status });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
    if (error instanceof HarmGovernanceError) return Response.json({ error: error.code }, { status: error.code === "case_not_found" ? 404 : 409 });
    throw error;
  }
}
