export type AdminDashboardMetrics = {
  activeProducts: number;
  featuredProducts: number;
  activeCategories: number;
  activeMaterials: number;
  activeColors: number;
  activeArchitects: number;
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
