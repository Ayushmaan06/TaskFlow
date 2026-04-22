import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@/utils/errors";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secret;
}

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: "USER" | "ADMIN";
  iat?: number;
  exp?: number;
}

/**
 * Signs a JWT token with a short expiry (default 15 minutes).
 * Short-lived tokens are a security best-practice; use refresh tokens for long sessions.
 */
export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  } as jwt.SignOptions);
}

/**
 * Verifies and decodes a JWT. Throws UnauthorizedError on any failure.
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload;

    if (
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string" ||
      (decoded.role !== "USER" && decoded.role !== "ADMIN")
    ) {
      throw new UnauthorizedError("Invalid token payload.");
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      throw err;
    }
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token has expired. Please login again.");
    }
    throw new UnauthorizedError("Invalid or malformed token.");
  }
}

/**
 * Extracts the Bearer token from an Authorization header.
 */
export function extractBearerToken(authHeader: string | null): string {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError(
      "Missing or malformed Authorization header. Expected: Bearer <token>"
    );
  }
  return authHeader.slice(7);
}
