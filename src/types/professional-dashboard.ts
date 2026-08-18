import type { ProjectOnboardingStatus, ProjectStatus } from "@/types/project";

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
  assignedClientFullName?: string | null;
  onboardingStatus?: ProjectOnboardingStatus | null;
  status: ProjectStatus;
  itemCount: number;
  roomCount?: number;
  actionHint?: string | null;
  updatedAt: string;
  unreadMessageCount: number;
};

export type ProfessionalDashboardData = {
  displayName: string;
  unreadNotificationCount: number;
  unreadMessageCount: number;
  changesRequestedCount: number;
  attentionProjectCount: number;
  stalePricingProjectCount: number;
  pendingOnboardingCount: number;
  activeProjectCount: number;
  submittedProjectCount: number;
  profileCompleteness: ProfileCompletenessSummary;
  dashboardProjects: ProfessionalDashboardProject[];
};

export const PROFESSIONAL_DASHBOARD_PROJECT_LIMIT = 5;
