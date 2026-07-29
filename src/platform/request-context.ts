export const REQUEST_ID_HEADER = "X-Request-ID";

export type RequestContext = {
  requestId: string;
};

type RequestHandler = (
  context: RequestContext
) => Response | Promise<Response>;

function withRequestId(response: Response, requestId: string): Response {
  const headers = new Headers(response.headers);
  headers.set(REQUEST_ID_HEADER, requestId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function logUnhandledError(request: Request, requestId: string): void {
  const url = new URL(request.url);
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      event: "request.unhandled_error",
      requestId,
      method: request.method,
      path: url.pathname,
    })
  );
}

export async function withRequestContext(
  request: Request,
  handler: RequestHandler
): Promise<Response> {
  const requestId = crypto.randomUUID();

  try {
    return withRequestId(await handler({ requestId }), requestId);
  } catch {
    logUnhandledError(request, requestId);
    return withRequestId(
      Response.json({ error: "internal_error" }, { status: 500 }),
      requestId
    );
  }
}
