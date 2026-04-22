import { prisma } from "@/lib/db";
import { CreateTaskInput, UpdateTaskInput } from "./schema";
import { ForbiddenError, NotFoundError } from "@/utils/errors";

const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Creates a new task owned by the authenticated user.
 */
export async function createTask(input: CreateTaskInput, userId: string) {
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      userId,
    },
    select: TASK_SELECT,
  });
}

/**
 * Returns all tasks belonging to the authenticated user.
 * Ordered by most recently created — cursor-based pagination can be added later.
 */
export async function getTasksByUser(userId: string) {
  return prisma.task.findMany({
    where: { userId },
    select: TASK_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Returns a single task by ID.
 * Enforces ownership — a user cannot read another user's task.
 */
export async function getTaskById(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: TASK_SELECT,
  });

  if (!task) throw new NotFoundError("Task not found.");
  if (task.userId !== userId) throw new ForbiddenError("You do not have access to this task.");

  return task;
}

/**
 * Updates a task. Only the owner may update their task.
 */
export async function updateTask(
  taskId: string,
  userId: string,
  input: UpdateTaskInput
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { userId: true },
  });

  if (!task) throw new NotFoundError("Task not found.");
  if (task.userId !== userId) throw new ForbiddenError("You cannot modify another user's task.");

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
    },
    select: TASK_SELECT,
  });
}

/**
 * Deletes a task. Only the owner may delete their task.
 */
export async function deleteTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { userId: true },
  });

  if (!task) throw new NotFoundError("Task not found.");
  if (task.userId !== userId) throw new ForbiddenError("You cannot delete another user's task.");

  await prisma.task.delete({ where: { id: taskId } });
  return { deleted: true };
}
