import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { EditorialGrantError, grantEditorialRole, revokeEditorialRole } from "../../../../application/publishing-authority";
import { EditorialAuthorityError } from "../../../../modules/publishing/authority";
import { executePrivilegedWrite } from "../../../../platform/privileged-write";
import { PUBLISHING_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../platform/rate-limit";

const grantSchema = z.object({ granteePersonId: z.string().min(1), publicationScope: z.string().min(1),
  role: z.enum(["editor", "reviewer", "translator"]), validUntil: z.string().datetime().nullable().default(null) });
const revokeSchema = z.object({ grantId: z.string().min(1), publicationScope: z.string().min(1) });

export function POST(request: Request) {
  return executePrivilegedWrite(
    request,
    PUBLISHING_PRIVILEGED_WRITE_RATE_LIMIT,
    async (runtime) => {
      const parsed = grantSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
      const actor = await createActorResolver(runtime.db).resolve(request);
      try {
        const grant = await grantEditorialRole(runtime.db, actor, { ...parsed.data,
          validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null });
        return Response.json({ grant }, { status: 201 });
      } catch (error) { return editorialError(error); }
    }
  );
}

export function DELETE(request: Request) {
  return executePrivilegedWrite(
    request,
    PUBLISHING_PRIVILEGED_WRITE_RATE_LIMIT,
    async (runtime) => {
      const parsed = revokeSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
      const actor = await createActorResolver(runtime.db).resolve(request);
      try { return Response.json({ grant: await revokeEditorialRole(runtime.db, actor, parsed.data) }); }
      catch (error) { return editorialError(error); }
    }
  );
}

function editorialError(error: unknown): Response {
  if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
  if (error instanceof EditorialAuthorityError || error instanceof EditorialGrantError) {
    const status = error.code.includes("not_found") ? 404 : 403;
    return Response.json({ error: error.code }, { status });
  }
  throw error;
}
