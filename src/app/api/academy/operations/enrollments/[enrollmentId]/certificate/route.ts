import { z } from "zod";
import { createActorResolver } from "../../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../../auth/authorize";
import { AcademyCompletionError, AcademyConflictError, AcademyNotFoundError, AcademySeparationOfDutiesError, issueAcademyCertificate, revokeAcademyCertificate } from "../../../../../../../application/academy";
import { executePrivilegedWrite } from "../../../../../../../platform/privileged-write";
import { ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../../../../platform/rate-limit";

export function POST(request: Request, context: { params: Promise<{ enrollmentId: string }> }) {
  return executePrivilegedWrite(request, ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const { enrollmentId } = await context.params;
    if (!z.string().uuid().safeParse(enrollmentId).success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await issueAcademyCertificate(runtime.db, actor, enrollmentId), { status: 201 });
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyNotFoundError) return Response.json({ error: error.code }, { status: 404 });
      if (error instanceof AcademySeparationOfDutiesError) return Response.json({ error: "separation_of_duties" }, { status: 409 });
      if (error instanceof AcademyCompletionError) return Response.json({ error: error.code }, { status: 409 });
      throw error;
    }
  });
}

export function DELETE(request: Request, context: { params: Promise<{ enrollmentId: string }> }) {
  return executePrivilegedWrite(request, ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const { enrollmentId } = await context.params;
    if (!z.string().uuid().safeParse(enrollmentId).success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await revokeAcademyCertificate(runtime.db, actor, enrollmentId));
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyNotFoundError) return Response.json({ error: error.code }, { status: 404 });
      if (error instanceof AcademySeparationOfDutiesError) return Response.json({ error: "separation_of_duties" }, { status: 409 });
      if (error instanceof AcademyConflictError) return Response.json({ error: error.code }, { status: 409 });
      throw error;
    }
  });
}
