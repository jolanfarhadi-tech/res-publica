import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { getAuthRuntime } from "../../../../auth/runtime";
import { assignReviewer, createDraftVersion, createSubmission, createTranslationAssignment,
  decideModeration, finalizeTranslation, PublishingError, signOffAndMarkReady } from "../../../../application/publishing";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create-submission"), publicationScope: z.string().min(1), title: z.string().min(1), rawContent: z.string().min(1) }),
  z.object({ action: z.literal("create-draft"), submissionId: z.string().min(1), content: z.string().min(1), citations: z.array(z.string().min(1)), weakCitationFlags: z.array(z.string().min(1)), authorType: z.enum(["ai", "human"]) }),
  z.object({ action: z.literal("assign-reviewer"), submissionId: z.string().min(1), draftId: z.string().min(1), reviewerPersonId: z.string().min(1) }),
  z.object({ action: z.literal("decide-moderation"), submissionId: z.string().min(1), draftId: z.string().min(1), decision: z.enum(["approved", "rejected"]), reason: z.string().trim().min(1) }),
  z.object({ action: z.literal("assign-translation"), draftId: z.string().min(1), locale: z.enum(["de", "en", "fa"]), translatorPersonId: z.string().min(1) }),
  z.object({ action: z.literal("finalize-translation"), handoffId: z.string().min(1), content: z.string().trim().min(1) }),
  z.object({ action: z.literal("mark-ready"), draftId: z.string().min(1) }),
]);

export async function POST(request: Request) {
  const rejection = rejectUntrustedWriteRequest(request); if (rejection) return rejection;
  const runtime = getAuthRuntime(); if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  const actor = await createActorResolver(runtime.db).resolve(request);
  try {
    switch (parsed.data.action) {
      case "create-submission": return Response.json(await createSubmission(runtime.db, actor, parsed.data), { status: 201 });
      case "create-draft": return Response.json({ draft: await createDraftVersion(runtime.db, actor, parsed.data) }, { status: 201 });
      case "assign-reviewer": return Response.json({ moderation: await assignReviewer(runtime.db, actor, parsed.data) });
      case "decide-moderation": return Response.json({ moderation: await decideModeration(runtime.db, actor, parsed.data) });
      case "assign-translation": return Response.json({ translation: await createTranslationAssignment(runtime.db, actor, parsed.data) }, { status: 201 });
      case "finalize-translation": return Response.json({ translation: await finalizeTranslation(runtime.db, actor, parsed.data) });
      case "mark-ready": return Response.json(await signOffAndMarkReady(runtime.db, actor, parsed.data.draftId), { status: 201 });
    }
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
    if (error instanceof PublishingError) {
      const status = error.code.endsWith("not_found") ? 404 : 409;
      return Response.json({ error: error.code }, { status });
    }
    throw error;
  }
}
