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
  submittedProjectCount: number;
  unreadAdminMessageCount: number;
  quoteAcceptedAwaitingApprovalCount: number;
  quoteChangeRequestedCount: number;
  quoteAwaitingArchitectCount: number;
  pendingArchitectRequestCount: number;
  metrics: AdminDashboardMetrics;
  recentSubmittedProjects: AdminDashboardRecentProject[];
};
