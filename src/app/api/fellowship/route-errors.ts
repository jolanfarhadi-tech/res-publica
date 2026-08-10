import { AuthorizationDeniedError } from "../../../auth/authorize";
import {
  FellowshipAuthenticationError,
  FellowshipConflictError,
  FellowshipNotFoundError,
  FellowshipOperationsAuthorizationError,
  FellowshipSeparationOfDutiesError,
  FellowshipStateError,
  FellowshipValidationError,
} from "../../../application/fellowship";

export const fellowshipPrivateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

export function fellowshipErrorResponse(error: unknown): Response | null {
  if (error instanceof FellowshipAuthenticationError) {
    return Response.json({ error: "authentication_required" }, { status: 401, headers: fellowshipPrivateHeaders });
  }
  if (error instanceof AuthorizationDeniedError || error instanceof FellowshipOperationsAuthorizationError) {
    return Response.json({ error: "forbidden" }, { status: 403, headers: fellowshipPrivateHeaders });
  }
  if (error instanceof FellowshipNotFoundError) {
    return Response.json({ error: error.code }, { status: 404, headers: fellowshipPrivateHeaders });
  }
  if (error instanceof FellowshipValidationError) {
    return Response.json({ error: error.code }, { status: 400, headers: fellowshipPrivateHeaders });
  }
  if (error instanceof FellowshipStateError || error instanceof FellowshipConflictError || error instanceof FellowshipSeparationOfDutiesError) {
    return Response.json({ error: error.code }, { status: 409, headers: fellowshipPrivateHeaders });
  }
  return null;
}
