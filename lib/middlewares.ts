import { NextRequest } from "next/server";
import { verifyToken, extractBearerToken, JwtPayload } from "@/lib/auth";
import { ForbiddenError } from "@/utils/errors";

/**
 * Authenticates the request by verifying the JWT.
 * Returns the decoded payload on success, throws on failure.
 */
export function authenticate(req: NextRequest): JwtPayload {
  const authHeader = req.headers.get("Authorization");
  const token = extractBearerToken(authHeader);
  return verifyToken(token);
}

/**
 * RBAC middleware — ensures the authenticated user has the ADMIN role.
 * Must be called AFTER authenticate().
 */
export function requireAdmin(user: JwtPayload): void {
  if (user.role !== "ADMIN") {
    throw new ForbiddenError(
      "Access denied: this route requires ADMIN privileges."
    );
  }
}
