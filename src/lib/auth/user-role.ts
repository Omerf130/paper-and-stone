import type { RequestedRole, StoredUserRole, UserRole } from "@/types/user";

export function normalizeUserRole(stored: StoredUserRole): UserRole {
  switch (stored) {
    case "customer":
      return "client";
    case "professional":
      return "architect";
    default:
      return stored;
  }
}

export function isClientRole(role: StoredUserRole): boolean {
  return normalizeUserRole(role) === "client";
}

export function isArchitectRole(role: StoredUserRole): boolean {
  return normalizeUserRole(role) === "architect";
}

export function isAdminRole(role: StoredUserRole): boolean {
  return role === "admin";
}

export const CLIENT_ROLE_FILTER = { $in: ["client", "customer"] as const };
export const ARCHITECT_ROLE_FILTER = {
  $in: ["architect", "professional"] as const,
};

export const ROLE_FILTER_MAP: Record<
  Exclude<UserRole, "admin">,
  { $in: readonly StoredUserRole[] }
> = {
  client: CLIENT_ROLE_FILTER,
  architect: ARCHITECT_ROLE_FILTER,
};

export function buildRoleFilter(role: UserRole): StoredUserRole | { $in: readonly StoredUserRole[] } {
  if (role === "admin") {
    return "admin";
  }

  return ROLE_FILTER_MAP[role];
}

export function isValidRequestedRole(value: unknown): value is RequestedRole {
  return value === null || value === undefined || value === "architect";
}
