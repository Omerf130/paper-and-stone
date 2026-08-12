import type { UserRole } from "@/types/user";

export type AdminUserListItem = {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUsersPageResult = {
  users: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type UserMutationState = {
  error?: string;
  success?: boolean;
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  customer: "לקוח",
  professional: "איש מקצוע",
  admin: "אדמין",
};
