import { NextRequest } from "next/server";
import { authenticate, requireAdmin } from "@/lib/middlewares";
import { getAllUsers } from "./service";
import { handleError } from "@/utils/errors";
import { successResponse, errorResponse } from "@/utils/response";

/**
 * GET /api/v1/users — Admin-only: returns all users with task counts
 */
export async function handleGetAllUsers(req: NextRequest) {
  try {
    const user = authenticate(req);
    requireAdmin(user);

    const users = await getAllUsers();
    return successResponse(users, "Users retrieved successfully.");
  } catch (error) {
    const { message, statusCode, errors } = handleError(error);
    return errorResponse(message, statusCode, errors);
  }
}
