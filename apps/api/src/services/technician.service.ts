import { UserRole } from "@repo/db";
import { ValidationError, NotFoundError } from "../lib/errors.js";
import { hashPassword } from "../lib/password.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  type TechnicianFilters,
  type UpdateTechnicianData,
  createTechnician,
  findTechnicianById,
  findTechnicianByUserId,
  findTechnicians,
  updateTechnician,
} from "../repositories/technician.repository.js";
import {
  createUser,
  findUserByEmail,
} from "../repositories/user.repository.js";

async function requireTechnician(id: string) {
  const tech = await findTechnicianById(id);
  if (!tech) throw new NotFoundError("technician not found");
  return tech;
}

export async function listTechnicians(filters: TechnicianFilters, _actor: AuthUser) {
  return findTechnicians(filters);
}

export async function getTechnician(id: string, _actor: AuthUser) {
  return requireTechnician(id);
}

export async function createTechnicianProfile(
  data: {
    name: string;
    email: string;
    password: string;
    employeeId: string;
    phone?: string;
    specializations?: string[];
  },
  _actor: AuthUser,
) {
  const existing = await findUserByEmail(data.email);
  if (existing) throw new ValidationError("email already in use");

  const passwordHash = await hashPassword(data.password);
  const user = await createUser({ name: data.name, email: data.email, passwordHash, role: UserRole.TECHNICIAN });

  return createTechnician({
    userId: user.id,
    employeeId: data.employeeId,
    phone: data.phone,
    specializations: data.specializations,
  });
}

export async function editTechnician(
  id: string,
  data: UpdateTechnicianData,
  _actor: AuthUser,
) {
  await requireTechnician(id);
  return updateTechnician(id, data);
}
