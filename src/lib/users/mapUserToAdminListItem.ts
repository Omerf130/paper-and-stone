import type { IUser } from "@/models/User";
import type {
  AdminUserListItem,
  ArchitectRequestListItem,
  ClientRequestListItem,
} from "@/types/admin-user";
import { normalizeUserRole } from "@/lib/auth/user-role";
import { normalizeAccountStatus } from "@/lib/users/account-status";

export function mapUserToAdminListItem(user: IUser): AdminUserListItem {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName ?? null,
    identificationNumber: user.identificationNumber ?? null,
    role: normalizeUserRole(user.role),
    requestedRole: user.requestedRole ?? null,
    accountStatus: normalizeAccountStatus(user.accountStatus),
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
  accountStatus?: AdminUserListItem["accountStatus"] | null;
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
    accountStatus: normalizeAccountStatus(user.accountStatus),
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

export function mapLeanUserToClientRequestListItem(user: {
  _id: { toString(): string };
  email: string;
  fullName?: string | null;
  identificationNumber?: string | null;
  role: IUser["role"];
  requestedRole: ClientRequestListItem["requestedRole"];
  accountStatus: ClientRequestListItem["accountStatus"];
  isActive: boolean;
  createdAt: Date;
}): ClientRequestListItem {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName ?? null,
    identificationNumber: user.identificationNumber ?? null,
    role: normalizeUserRole(user.role),
    requestedRole: user.requestedRole ?? null,
    accountStatus: normalizeAccountStatus(user.accountStatus),
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}
