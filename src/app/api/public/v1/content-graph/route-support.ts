import { z } from "zod";
import { PUBLIC_API_LOCALES } from "../../../../../modules/public-api/projection";

export const publicApiQuerySchema = z.object({
  locale: z.enum(PUBLIC_API_LOCALES).optional(),
  cursor: z.string().min(1).max(2_000).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
}).strict();

export function searchParams(request: Request): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}
