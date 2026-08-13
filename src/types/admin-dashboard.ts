export type AdminDashboardMetrics = {
  activeProducts: number;
  featuredProducts: number;
  activeCategories: number;
  activeMaterials: number;
  activeColors: number;
  activeProfessionals: number;
};

export type AdminDashboardRecentProject = {
  id: string;
  name: string;
  submittedAt: string;
};

export type AdminDashboardData = {
  submittedProjectCount: number;
  unreadAdminMessageCount: number;
  metrics: AdminDashboardMetrics;
  recentSubmittedProjects: AdminDashboardRecentProject[];
};
