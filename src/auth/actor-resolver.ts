import type { Database } from "../persistence";
import { hashSecret } from "./crypto";
import { resolveSession } from "./store";
import type { ActorResolver } from "./types";

export const SESSION_COOKIE_NAME = "__Host-rp_session";

function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export function createActorResolver(db: Database): ActorResolver {
  return {
    async resolve(request) {
      const token = readCookie(request, SESSION_COOKIE_NAME);
      return token ? resolveSession(db, hashSecret(token)) : null;
    },
  };
}
