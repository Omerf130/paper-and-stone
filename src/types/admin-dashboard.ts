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
  status: string;
  updatedAt: string;
  location?: string;
  itemCount: number;
};

export type AdminDashboardActivityEntry = {
  id: string;
  kind:
    | "project_updated"
    | "project_submitted"
    | "client_request"
    | "architect_request";
  primary: string;
  secondary: string;
  timestamp: string;
  href?: string;
};

export type AdminDashboardRecentProduct = {
  id: string;
  nameHe: string;
  sku: string;
  updatedAt: string;
};

export type AdminDashboardQueueSummary = {
  all: number;
  attention: number;
  active: number;
  commercial: number;
  onboarding: number;
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
  recentProjects: AdminDashboardRecentProject[];
  /** @deprecated use recentProjects */
  recentSubmittedProjects: AdminDashboardRecentProject[];
  activityFeed: AdminDashboardActivityEntry[];
  queueSummary: AdminDashboardQueueSummary;
  recentProducts: AdminDashboardRecentProduct[];
  productThumbnailsById: Record<string, { url: string; altText: string }>;
};
