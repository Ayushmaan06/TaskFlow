import { prisma } from "@/lib/db";

/**
 * Returns all users — paginated in production, kept simple here for clarity.
 * ADMIN-only: enforced at controller level.
 * Password is NEVER returned.
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
