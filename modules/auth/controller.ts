import { NextRequest } from "next/server";
import { registerUser, loginUser } from "./service";
import { registerSchema, loginSchema } from "./schema";
import { handleError } from "@/utils/errors";
import { successResponse, createdResponse, errorResponse } from "@/utils/response";

/**
 * POST /api/v1/auth/register
 * Validates input → delegates to service → returns sanitized user object
 */
export async function register(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const user = await registerUser(parsed.data);
    return createdResponse(user, "Account created successfully. Please login.");
  } catch (error) {
    const { message, statusCode, errors } = handleError(error);
    return errorResponse(message, statusCode, errors);
  }
}

/**
 * POST /api/v1/auth/login
 * Validates input → verifies credentials → returns JWT token
 */
export async function login(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const result = await loginUser(parsed.data);
    return successResponse(result, "Login successful.");
  } catch (error) {
    const { message, statusCode, errors } = handleError(error);
    return errorResponse(message, statusCode, errors);
  }
}
