import type { UserRole } from "@/types/user";

export const USERS_PAGE_SIZE = 20;

export type UserStatusFilter = "active" | "inactive";

export type AdminUsersParams = {
  query: string | null;
  role: UserRole | null;
  status: UserStatusFilter | null;
  page: number;
};

export type AdminUsersHrefInput = {
  query?: string | null;
  role?: UserRole | null;
  status?: UserStatusFilter | null;
  page?: number;
};

const USER_ROLES: UserRole[] = ["client", "architect", "admin"];
const USER_STATUSES: UserStatusFilter[] = ["active", "inactive"];

function parsePageValue(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function parseStringParam(
  raw: string | string[] | undefined,
): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function parseRoleParam(
  raw: string | string[] | undefined,
): UserRole | null {
  const value = parseStringParam(raw);

  if (!value || !USER_ROLES.includes(value as UserRole)) {
    return null;
  }

  return value as UserRole;
}

function parseStatusParam(
  raw: string | string[] | undefined,
): UserStatusFilter | null {
  const value = parseStringParam(raw);

  if (!value || !USER_STATUSES.includes(value as UserStatusFilter)) {
    return null;
  }

  return value as UserStatusFilter;
}

export function parseAdminUsersParams(
  raw: Record<string, string | string[] | undefined>,
): AdminUsersParams {
  return {
    query: parseStringParam(raw.q),
    role: parseRoleParam(raw.role),
    status: parseStatusParam(raw.status),
    page: parsePageValue(raw.page),
  };
}

export function buildAdminUsersHref(input: AdminUsersHrefInput = {}): string {
  const params = new URLSearchParams();

  const query = input.query?.trim();
  if (query) {
    params.set("q", query);
  }

  if (input.role) {
    params.set("role", input.role);
  }

  if (input.status) {
    params.set("status", input.status);
  }

  if (input.page && input.page > 1) {
    params.set("page", String(input.page));
  }

  const search = params.toString();
  return search ? `/admin/users?${search}` : "/admin/users";
}
