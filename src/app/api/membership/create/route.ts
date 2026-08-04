import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { withRequestContext } from "../../../../platform/request-context";

async function handlePost(request: Request) {
  const rejection = rejectUntrustedWriteRequest(request);
  if (rejection) return rejection;
  return Response.json(
    {
      error: "membership_application_required",
      applicationEndpoint: "/api/membership/applications",
    },
    { status: 410 }
  );
}

export function POST(request: Request) {
  return withRequestContext(request, () => handlePost(request));
}
