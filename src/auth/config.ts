import { z } from "zod";

const oidcEnvironmentSchema = z.object({
  OIDC_ISSUER: z.string().url(),
  OIDC_CLIENT_ID: z.string().min(1),
  OIDC_CLIENT_SECRET: z.string().min(1).optional(),
  OIDC_REDIRECT_URI: z.string().url(),
  OIDC_SCOPE: z.string().min(1).default("openid profile email"),
});

export type OidcEnvironment = z.infer<typeof oidcEnvironmentSchema>;

export function readOidcEnvironment(
  environment: Record<string, string | undefined> = process.env
): OidcEnvironment | null {
  const result = oidcEnvironmentSchema.safeParse(environment);
  return result.success ? result.data : null;
}
