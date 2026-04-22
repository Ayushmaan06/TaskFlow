import { NextRequest } from "next/server";
import { authenticate } from "@/lib/middlewares";
import {
  createTask,
  getTasksByUser,
  getTaskById,
  updateTask,
  deleteTask,
} from "./service";
import { createTaskSchema, taskIdSchema, updateTaskSchema } from "./schema";
import { handleError } from "@/utils/errors";
import { successResponse, createdResponse, errorResponse } from "@/utils/response";

/**
 * POST /api/v1/tasks — Create a new task
 */
export async function handleCreateTask(req: NextRequest) {
  try {
    const user = authenticate(req);
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const task = await createTask(parsed.data, user.sub);
    return createdResponse(task, "Task created successfully.");
  } catch (error) {
    const { message, statusCode, errors } = handleError(error);
    return errorResponse(message, statusCode, errors);
  }
}

/**
 * GET /api/v1/tasks — List all tasks for authenticated user
 */
export async function handleGetTasks(req: NextRequest) {
  try {
    const user = authenticate(req);
    const tasks = await getTasksByUser(user.sub);
    return successResponse(tasks, "Tasks retrieved successfully.");
  } catch (error) {
    const { message, statusCode, errors } = handleError(error);
    return errorResponse(message, statusCode, errors);
  }
}

/**
 * GET /api/v1/tasks/:id — Get single task by ID
 */
export async function handleGetTaskById(
  req: NextRequest,
  taskId: string
) {
  try {
    const user = authenticate(req);
    const parsedId = taskIdSchema.safeParse(taskId);
    if (!parsedId.success) {
      return errorResponse("Validation failed", 400, parsedId.error.flatten().fieldErrors);
    }

    const task = await getTaskById(parsedId.data, user.sub);
    return successResponse(task, "Task retrieved successfully.");
  } catch (error) {
    const { message, statusCode, errors } = handleError(error);
    return errorResponse(message, statusCode, errors);
  }
}

/**
 * PUT /api/v1/tasks/:id — Update a task
 */
export async function handleUpdateTask(
  req: NextRequest,
  taskId: string
) {
  try {
    const user = authenticate(req);
    const parsedId = taskIdSchema.safeParse(taskId);
    if (!parsedId.success) {
      return errorResponse("Validation failed", 400, parsedId.error.flatten().fieldErrors);
    }

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const task = await updateTask(parsedId.data, user.sub, parsed.data);
    return successResponse(task, "Task updated successfully.");
  } catch (error) {
    const { message, statusCode, errors } = handleError(error);
    return errorResponse(message, statusCode, errors);
  }
}

/**
 * DELETE /api/v1/tasks/:id — Delete a task
 */
export async function handleDeleteTask(
  req: NextRequest,
  taskId: string
) {
  try {
    const user = authenticate(req);
    const parsedId = taskIdSchema.safeParse(taskId);
    if (!parsedId.success) {
      return errorResponse("Validation failed", 400, parsedId.error.flatten().fieldErrors);
    }

    await deleteTask(parsedId.data, user.sub);
    return successResponse(null, "Task deleted successfully.");
  } catch (error) {
    const { message, statusCode, errors } = handleError(error);
    return errorResponse(message, statusCode, errors);
  }
}
