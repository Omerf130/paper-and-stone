import type { RequestedRole, UserRole } from "@/types/user";

export type AdminUserListItem = {
  id: string;
  email: string;
  fullName?: string | null;
  identificationNumber?: string | null;
  role: UserRole;
  requestedRole?: RequestedRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ArchitectRequestListItem = {
  id: string;
  email: string;
  fullName?: string | null;
  identificationNumber?: string | null;
  role: UserRole;
  requestedRole: "architect";
  isActive: boolean;
  createdAt: string;
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
  client: "לקוח",
  architect: "אדריכל",
  admin: "אדמין",
};

export const REQUESTED_ROLE_LABEL = "ביקש הרשאת אדריכל";

export const USER_TYPE_LABELS = {
  client: "לקוח",
  architect: "אדריכל",
} as const;
