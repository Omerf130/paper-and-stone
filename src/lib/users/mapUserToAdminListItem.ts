import type { IUser } from "@/models/User";
import type {
  AdminUserListItem,
  ArchitectRequestListItem,
} from "@/types/admin-user";
import { normalizeUserRole } from "@/lib/auth/user-role";

export function mapUserToAdminListItem(user: IUser): AdminUserListItem {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName ?? null,
    identificationNumber: user.identificationNumber ?? null,
    role: normalizeUserRole(user.role),
    requestedRole: user.requestedRole ?? null,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function mapLeanUserToAdminListItem(user: {
  _id: { toString(): string };
  email: string;
  fullName?: string | null;
  identificationNumber?: string | null;
  role: IUser["role"];
  requestedRole?: AdminUserListItem["requestedRole"];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AdminUserListItem {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName ?? null,
    identificationNumber: user.identificationNumber ?? null,
    role: normalizeUserRole(user.role),
    requestedRole: user.requestedRole ?? null,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function mapLeanUserToArchitectRequestListItem(user: {
  _id: { toString(): string };
  email: string;
  fullName?: string | null;
  identificationNumber?: string | null;
  role: IUser["role"];
  requestedRole: "architect";
  isActive: boolean;
  createdAt: Date;
}): ArchitectRequestListItem {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName ?? null,
    identificationNumber: user.identificationNumber ?? null,
    role: normalizeUserRole(user.role),
    requestedRole: "architect",
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}
