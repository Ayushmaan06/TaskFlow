import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { RegisterInput, LoginInput } from "./schema";
import { ConflictError, UnauthorizedError } from "@/utils/errors";

const SALT_ROUNDS = 12;

/**
 * Registers a new user.
 * - Checks for duplicate email before hashing to avoid unnecessary bcrypt work.
 * - Password is hashed with bcrypt (cost factor 12).
 * - Returns user data without the password field.
 */
export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError("An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Authenticates a user and returns a signed JWT.
 * - Uses bcrypt.compare (constant-time) to prevent timing attacks.
 * - Generic error message to avoid user enumeration.
 */
export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // Use constant-time comparison even if user not found (dummy hash) to prevent timing attacks
  const dummyHash =
    "$2a$12$dummyhashfordummypurposesonly.notreal/dummyhashhere.";
  const isValid = await bcrypt.compare(
    input.password,
    user?.password ?? dummyHash
  );

  if (!user || !isValid) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
