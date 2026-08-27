import { NotFoundError, ValidationError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import { findUserById } from "../repositories/user.repository.js";
import {
  type CreateTechnicianData,
  type TechnicianFilters,
  type UpdateTechnicianData,
  createTechnician,
  findTechnicianById,
  findTechnicianByUserId,
  findTechnicians,
  updateTechnician,
} from "../repositories/technician.repository.js";

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
  data: Omit<CreateTechnicianData, never>,
  _actor: AuthUser,
) {
  const user = await findUserById(data.userId);
  if (!user) throw new NotFoundError("user not found");

  const existing = await findTechnicianByUserId(data.userId);
  if (existing) throw new ValidationError("user already has a technician profile");

  return createTechnician(data);
}

export async function editTechnician(
  id: string,
  data: UpdateTechnicianData,
  _actor: AuthUser,
) {
  await requireTechnician(id);
  return updateTechnician(id, data);
}
