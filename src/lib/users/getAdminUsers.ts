import { connectDB } from "@/lib/db/mongoose";
import { escapeRegex } from "@/lib/catalog/escape-regex";
import { calculatePagination } from "@/lib/catalog/catalog-pagination";
import { buildRoleFilter } from "@/lib/auth/user-role";
import User from "@/models/User";
import { mapLeanUserToAdminListItem } from "@/lib/users/mapUserToAdminListItem";
import {
  USERS_PAGE_SIZE,
  type AdminUsersParams,
} from "@/lib/users/user-params";
import type { AdminUsersPageResult } from "@/types/admin-user";
import type { StoredUserRole, UserRole } from "@/types/user";

type AdminUsersFilter = {
  email?: { $regex: string; $options: string };
  role?: StoredUserRole | { $in: readonly StoredUserRole[] };
  isActive?: boolean;
};

export function buildAdminUsersFilter(
  params: AdminUsersParams,
): AdminUsersFilter {
  const filter: AdminUsersFilter = {};

  if (params.query) {
    filter.email = {
      $regex: escapeRegex(params.query),
      $options: "i",
    };
  }

  if (params.role) {
    filter.role = buildRoleFilter(params.role) as AdminUsersFilter["role"];
  }

  if (params.status === "active") {
    filter.isActive = true;
  } else if (params.status === "inactive") {
    filter.isActive = false;
  }

  return filter;
}

export async function getAdminUsers(
  params: AdminUsersParams,
): Promise<AdminUsersPageResult> {
  await connectDB();

  const filter = buildAdminUsersFilter(params);
  const total = await User.countDocuments(filter);
  const pagination = calculatePagination({
    total,
    page: params.page,
    pageSize: USERS_PAGE_SIZE,
  });

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .lean();

  return {
    users: users.map(mapLeanUserToAdminListItem),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
  };
}

export function isCanonicalUserRole(role: UserRole): role is UserRole {
  return role === "client" || role === "architect" || role === "admin";
}
