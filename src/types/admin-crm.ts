import type { AccountStatus } from "@/lib/users/account-status";
import type { ProjectOnboardingStatus, ProjectStatus } from "@/types/project";
import type { ProfessionalProfileView } from "@/types/professional-profile";

export type AdminClientListItemView = {
  id: string;
  email: string;
  fullName?: string | null;
  identificationNumber?: string | null;
  accountStatus: AccountStatus;
  isActive: boolean;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminClientDetailView = AdminClientListItemView;

export type AdminArchitectListItemView = {
  id: string;
  email: string;
  fullName?: string | null;
  identificationNumber?: string | null;
  companyName?: string | null;
  phone?: string | null;
  isActive: boolean;
  projectCount: number;
  profileFilledCount: number;
  profileTotalCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminArchitectDetailView = {
  id: string;
  email: string;
  fullName?: string | null;
  identificationNumber?: string | null;
  isActive: boolean;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
  profile: ProfessionalProfileView;
  profileMissingFields: string[];
};

export type AdminCrmProjectView = {
  id: string;
  name: string;
  onboardingStatus?: ProjectOnboardingStatus | null;
  status: ProjectStatus;
  itemCount: number;
  architectName?: string;
  architectUserId?: string;
  clientName?: string;
  clientUserId?: string | null;
  updatedAt: string;
};

export type AdminClientsPageResult = {
  clients: AdminClientListItemView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminArchitectsPageResult = {
  architects: AdminArchitectListItemView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const CRM_ERRORS = {
  NOT_FOUND: "הרשומה לא נמצאה.",
  EMAIL_EXISTS: "כתובת המייל כבר קיימת במערכת.",
  CLIENT_NOT_ELIGIBLE: "הלקוח אינו זמין לשיוך.",
  ARCHITECT_NOT_ELIGIBLE: "האדריכל אינו זמין לשיוך.",
  PROJECT_CREATE_FAILED: "יצירת הפרויקט נכשלה.",
  SAME_ARCHITECT: "הפרויקט כבר משויך לאדריכל זה.",
  DEACTIVATE_CLIENT_ASSIGNED: "לא ניתן להשבית לקוח המשויך לפרויקט פעיל.",
  DEACTIVATE_ARCHITECT_OWNS: "לא ניתן להשבית אדריכל שבבעלותו פרויקט פעיל.",
} as const;
