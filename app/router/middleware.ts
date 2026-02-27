import { implement } from "@orpc/server";
import { contract } from "../contract";

export interface User {
  id: string;
}

export interface BaseContext {
  headers: Headers;
}

export interface AuthedContext extends BaseContext {
  user: User;
}

export interface OptionalAuthContext extends BaseContext {
  user: User | null;
}

/**
 * Extracts a user from the Bearer token. In production this would verify a JWT
 * or look up a session. For demo purposes we treat the token as the userId.
 */
function parseToken(authorization: string | null): User | null {
  if (!authorization) return null;
  const token = authorization.split(" ")[1];
  if (!token) return null;
  return { id: token };
}

const os = implement(contract);

/**
 * Requires a valid Bearer token. Throws UNAUTHORIZED if missing.
 */
export const authMiddleware = os
  .$context<BaseContext>()
  .middleware(async ({ context, next, errors }) => {
    const user = parseToken(context.headers.get("authorization"));
    if (!user) {
      throw errors.UNAUTHORIZED();
    }
    return next({ context: { user } });
  });

/**
 * Optionally resolves a user from the Bearer token. Sets user to null if absent.
 */
export const optionalAuthMiddleware = os
  .$context<BaseContext>()
  .middleware(async ({ context, next }) => {
    const user = parseToken(context.headers.get("authorization"));
    return next({ context: { user } });
  });
