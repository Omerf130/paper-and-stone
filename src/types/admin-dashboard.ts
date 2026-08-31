export type AdminDashboardMetrics = {
  clients: number;
  architects: number;
  projects: number;
  activeProjects: number;
  attentionProjects: number;
};

export type AdminDashboardRecentProject = {
  id: string;
  name: string;
  submittedAt: string;
};

export type AdminDashboardData = {
  attentionProjectCount: number;
  activeProjectCount: number;
  submittedProjectCount: number;
  pendingOnboardingProjectCount: number;
  unreadAdminMessageCount: number;
  quoteAcceptedAwaitingApprovalCount: number;
  quoteChangeRequestedCount: number;
  quoteAwaitingArchitectCount: number;
  pendingArchitectRequestCount: number;
  pendingClientRequestCount: number;
  metrics: AdminDashboardMetrics;
  recentSubmittedProjects: AdminDashboardRecentProject[];
};
