import { publicApiJson } from "../../../../modules/public-api/http";
import { withRequestContext } from "../../../../platform/request-context";

const descriptor = {
  data: {
    name: "Res Publica Public API",
    version: "v1",
    access: "read-only",
    scope: "grounded public content only",
    resources: {
      entities: "/api/public/v1/content-graph/entities",
      relationships: "/api/public/v1/content-graph/relationships",
    },
    attribution: "Public source URLs must be preserved",
  },
  meta: {
    privateTableData: false,
    deterministic: true,
    humanVerified: true,
  },
} as const;

export function GET(request: Request) {
  return withRequestContext(request, async () => publicApiJson(request, descriptor));
}
