import { UserRole } from "@repo/db";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import { hashPassword } from "../lib/password.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  type UpdateUserData,
  type UserFilters,
  createUser,
  findUserByEmail,
  findUserById,
  findUsers,
  updateUser,
} from "../repositories/user.repository.js";

const STAFF_ROLES = new Set<UserRole>([UserRole.ADMIN, UserRole.OPERATIONS, UserRole.FINANCE]);

async function requireUser(id: string) {
  const user = await findUserById(id);
  if (!user) throw new NotFoundError("user not found");
  return user;
}

export async function listUsers(filters: UserFilters, _actor: AuthUser) {
  return findUsers(filters);
}

export async function getUser(id: string, _actor: AuthUser) {
  return requireUser(id);
}

export async function createStaffUser(
  data: { name: string; email: string; password: string; role: UserRole },
  _actor: AuthUser,
) {
  if (!STAFF_ROLES.has(data.role)) {
    throw new ValidationError("use the technicians endpoint to create TECHNICIAN accounts");
  }
  const existing = await findUserByEmail(data.email);
  if (existing) throw new ValidationError("email already in use");
  const passwordHash = await hashPassword(data.password);
  return createUser({ name: data.name, email: data.email, passwordHash, role: data.role });
}

export async function editUser(id: string, data: UpdateUserData, _actor: AuthUser) {
  await requireUser(id);
  return updateUser(id, data);
}
