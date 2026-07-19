export function isTrustedWriteRequest(request: Request): boolean {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (origin !== null && origin !== requestUrl.origin) return false;
  if (fetchSite !== null && fetchSite !== "same-origin" && fetchSite !== "none") return false;
  return origin !== null || fetchSite === "same-origin";
}

export function rejectUntrustedWriteRequest(request: Request): Response | null {
  return isTrustedWriteRequest(request)
    ? null
    : Response.json({ error: "untrusted_origin" }, { status: 403 });
}
