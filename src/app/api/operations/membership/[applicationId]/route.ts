import { createActorResolver } from "../../../../../auth/actor-resolver";
import { getAuthRuntime } from "../../../../../auth/runtime";
import {
  getMembershipApplicationForOperations,
  OperationsApplicationNotFoundError,
  OperationsAuthenticationError,
  OperationsAuthorizationError,
  OperationsMfaRequiredError,
  OperationsSeparationOfDutiesError,
} from "../../../../../application/operations-console";
import { withRequestContext } from "../../../../../platform/request-context";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};
const APPLICATION_ID = /^[a-z0-9][a-z0-9_-]{0,127}$/i;

export function GET(
  request: Request,
  context: { params: Promise<{ applicationId: string }> }
) {
  return withRequestContext(request, async () => {
    const { applicationId } = await context.params;
    if (!APPLICATION_ID.test(applicationId)) {
      return Response.json(
        { error: "invalid_application_id" },
        { status: 400, headers: PRIVATE_HEADERS }
      );
    }

    const runtime = getAuthRuntime();
    if (!runtime) {
      return Response.json(
        { error: "service_not_configured" },
        { status: 503, headers: PRIVATE_HEADERS }
      );
    }

    const actor = await createActorResolver(runtime.db).resolve(request);
    try {
      return Response.json(
        await getMembershipApplicationForOperations(
          runtime.db,
          actor,
          applicationId
        ),
        { headers: PRIVATE_HEADERS }
      );
    } catch (error) {
      if (error instanceof OperationsAuthenticationError) {
        return Response.json(
          { error: "authentication_required" },
          { status: 401, headers: PRIVATE_HEADERS }
        );
      }
      if (error instanceof OperationsMfaRequiredError) {
        return Response.json(
          { error: "mfa_required" },
          { status: 403, headers: PRIVATE_HEADERS }
        );
      }
      if (
        error instanceof OperationsAuthorizationError ||
        error instanceof OperationsSeparationOfDutiesError
      ) {
        return Response.json(
          { error: "forbidden" },
          { status: 403, headers: PRIVATE_HEADERS }
        );
      }
      if (error instanceof OperationsApplicationNotFoundError) {
        return Response.json(
          { error: "application_not_found" },
          { status: 404, headers: PRIVATE_HEADERS }
        );
      }
      throw error;
    }
  });
}
