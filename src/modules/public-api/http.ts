import { createHash } from "node:crypto";

export const publicApiCacheHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
  Vary: "Accept-Encoding",
};

export function publicApiJson(request: Request, body: unknown): Response {
  const serialized = JSON.stringify(body);
  const etag = `"${createHash("sha256").update(serialized).digest("base64url")}"`;
  const headers = { ...publicApiCacheHeaders, ETag: etag };
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(serialized, {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

export function publicApiError(code: string, status: number): Response {
  return Response.json(
    { error: { code } },
    {
      status,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    }
  );
}
