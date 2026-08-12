import type { IUser } from "@/models/User";
import type { AdminUserListItem } from "@/types/admin-user";

export function mapUserToAdminListItem(user: IUser): AdminUserListItem {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function mapLeanUserToAdminListItem(user: {
  _id: { toString(): string };
  email: string;
  role: AdminUserListItem["role"];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AdminUserListItem {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
