export type UserRole = "ADMIN" | "OPERATIONS" | "FINANCE" | "TECHNICIAN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  OPERATIONS: "Operations",
  FINANCE: "Finance",
  TECHNICIAN: "Technician",
};

export const STAFF_ROLES: Exclude<UserRole, "TECHNICIAN">[] = ["ADMIN", "OPERATIONS", "FINANCE"];
