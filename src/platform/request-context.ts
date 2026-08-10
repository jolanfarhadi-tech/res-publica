export const REQUEST_ID_HEADER = "X-Request-ID";

export type RequestContext = {
  requestId: string;
};

type OperationalFailureEvent = {
  event:
    | "auth.provider_unavailable"
    | "health.database_unavailable"
    | "notification.delivery_failed"
    | "request.unhandled_error";
  requestId?: string;
  method?: string;
  path?: string;
  dependency?: "database" | "oidc" | "notification-provider";
  status?: number;
  attemptNumber?: number;
  retryable?: boolean;
  errorCode?: string;
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

export function logOperationalFailure(event: OperationalFailureEvent): void {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      ...event,
    })
  );
}

function logUnhandledError(request: Request, requestId: string): void {
  const url = new URL(request.url);
  logOperationalFailure({
    event: "request.unhandled_error",
    requestId,
    method: request.method,
    path: url.pathname,
    status: 500,
  });
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
