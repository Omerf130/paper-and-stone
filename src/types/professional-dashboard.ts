import type { ProjectStatus } from "@/types/project";

export type ProfileCompletenessSummary = {
  filledCount: number;
  totalCount: number;
  isComplete: boolean;
  missingFields: string[];
};

export type ProfessionalDashboardProject = {
  id: string;
  name: string;
  clientName?: string;
  status: ProjectStatus;
  itemCount: number;
  updatedAt: string;
  unreadMessageCount: number;
};

export type ProfessionalDashboardData = {
  displayName: string;
  unreadNotificationCount: number;
  unreadMessageCount: number;
  changesRequestedCount: number;
  profileCompleteness: ProfileCompletenessSummary;
  dashboardProjects: ProfessionalDashboardProject[];
};

export const PROFESSIONAL_DASHBOARD_PROJECT_LIMIT = 5;
