import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title must not exceed 255 characters")
    .trim(),
  description: z
    .string()
    .max(5000, "Description must not exceed 5000 characters")
    .trim()
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title must not exceed 255 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(5000, "Description must not exceed 5000 characters")
    .trim()
    .nullable()
    .optional(),
}).refine(
  (data) => data.title !== undefined || data.description !== undefined,
  {
    message: "At least one field (title or description) is required for update.",
  }
);

export const taskIdSchema = z.string().uuid("Invalid task id format.");

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
