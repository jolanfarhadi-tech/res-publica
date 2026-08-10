import { z } from "zod";
import { createActorResolver } from "../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../auth/authorize";
import { getAuthRuntime } from "../../../../../auth/runtime";
import {
  AcademyOperationsAuthorizationError,
  AcademyValidationError,
  createAcademyCourse,
  getAcademyOperationsOverview,
} from "../../../../../application/academy";
import { executePrivilegedWrite } from "../../../../../platform/privileged-write";
import { ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../../platform/rate-limit";
import { withRequestContext } from "../../../../../platform/request-context";

const locale = z.object({
  title: z.string().min(1).max(300),
  summary: z.string().min(1).max(2_000),
  description: z.string().min(1).max(50_000),
  learningOutcomes: z.array(z.string().min(1).max(1_000)).min(1).max(30),
  sourceRefs: z.array(z.string().min(1).max(500)).min(1).max(50),
});
const lessonTranslation = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(100_000),
  sourceRefs: z.array(z.string().min(1).max(500)).min(1).max(50),
});
const moduleTranslation = z.object({ title: z.string().min(1).max(300), summary: z.string().min(1).max(2_000) });
const assessmentTranslation = z.object({ title: z.string().min(1).max(300), prompt: z.string().min(1).max(20_000) });
const date = z.string().datetime().transform((value) => new Date(value));
const schema = z.object({
  slug: z.string().min(1).max(200),
  programId: z.string().uuid().nullable().optional(),
  enrollmentPolicy: z.enum(["public", "member-only", "invitation", "application"]),
  translations: z.object({ de: locale, en: locale, fa: locale }),
  modules: z.array(z.object({
    position: z.number().int().positive(), required: z.boolean(),
    translations: z.object({ de: moduleTranslation, en: moduleTranslation, fa: moduleTranslation }),
    lessons: z.array(z.object({
      position: z.number().int().positive(), required: z.boolean(),
      translations: z.object({ de: lessonTranslation, en: lessonTranslation, fa: lessonTranslation }),
      resources: z.array(z.object({
        kind: z.enum(["document", "link", "audio", "video"]),
        uri: z.string().url().max(2_000).refine((value) => value.startsWith("https://")), locale: z.enum(["de", "en", "fa"]),
        label: z.string().min(1).max(300), accessibilityLabel: z.string().min(1).max(500),
        position: z.number().int().positive(),
      })).max(100).optional(),
    })).max(200),
  })).max(100).optional(),
  cohorts: z.array(z.object({
    startsAt: date, endsAt: date, enrollmentOpensAt: date,
    enrollmentClosesAt: date, capacity: z.number().int().positive().max(10_000),
  })).max(100).optional(),
  assessments: z.array(z.object({
    modulePosition: z.number().int().positive().optional(), required: z.boolean(),
    reviewCriteria: z.array(z.string().min(1).max(1_000)).min(1).max(50),
    translations: z.object({ de: assessmentTranslation, en: assessmentTranslation, fa: assessmentTranslation }),
  })).max(100).optional(),
});
const privateHeaders = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const runtime = getAuthRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503, headers: privateHeaders });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await getAcademyOperationsOverview(runtime.db, actor), { headers: privateHeaders });
    } catch (error) {
      if (error instanceof AcademyOperationsAuthorizationError) {
        return Response.json({ error: "forbidden" }, { status: 403, headers: privateHeaders });
      }
      throw error;
    }
  });
}

export function POST(request: Request) {
  return executePrivilegedWrite(request, ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await createAcademyCourse(runtime.db, actor, parsed.data), { status: 201, headers: privateHeaders });
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyValidationError) return Response.json({ error: error.code }, { status: 400 });
      throw error;
    }
  });
}
