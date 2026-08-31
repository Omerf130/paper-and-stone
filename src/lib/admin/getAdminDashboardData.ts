import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import {
  countApprovedActiveArchitects,
  countApprovedActiveClients,
} from "@/lib/admin/admin-dashboard-metrics";
import { getUnreadAdminProjectMessageCount } from "@/lib/project-messages/getUnreadAdminProjectMessageCount";
import { getAdminQuoteAttentionSummary } from "@/lib/quotes/quote-queries";
import {
  getActiveProjectCount,
  getAdminProjectAttentionCount,
} from "@/lib/projects/getAdminProjects";
import { countPendingArchitectRequests } from "@/lib/users/architect-request-queries";
import { countPendingClientRequests } from "@/lib/users/client-request-queries";
import type { AdminDashboardData } from "@/types/admin-dashboard";

export async function getAdminDashboardData(
  adminUserId: string,
): Promise<AdminDashboardData> {
  await connectDB();

  const [
    attentionProjectCount,
    activeProjectCount,
    submittedProjectCount,
    pendingOnboardingProjectCount,
    unreadAdminMessageCount,
    quoteAttention,
    clients,
    architects,
    projects,
    pendingArchitectRequestCount,
    pendingClientRequestCount,
    recentSubmittedProjects,
  ] = await Promise.all([
    getAdminProjectAttentionCount(),
    getActiveProjectCount(),
    Project.countDocuments({ status: "submitted" }),
    Project.countDocuments({ onboardingStatus: "pending_approval" }),
    getUnreadAdminProjectMessageCount(adminUserId),
    getAdminQuoteAttentionSummary(),
    countApprovedActiveClients(),
    countApprovedActiveArchitects(),
    Project.countDocuments({}),
    countPendingArchitectRequests(),
    countPendingClientRequests(),
    Project.find({ status: "submitted" })
      .sort({ submittedAt: -1 })
      .limit(5)
      .select("name submittedAt")
      .lean(),
  ]);

  return {
    attentionProjectCount,
    activeProjectCount,
    submittedProjectCount,
    pendingOnboardingProjectCount,
    unreadAdminMessageCount,
    quoteAcceptedAwaitingApprovalCount:
      quoteAttention.quoteAcceptedAwaitingApprovalCount,
    quoteChangeRequestedCount: quoteAttention.quoteChangeRequestedCount,
    quoteAwaitingArchitectCount:
      quoteAttention.quoteAwaitingProfessionalCount,
    pendingArchitectRequestCount,
    pendingClientRequestCount,
    metrics: {
      clients,
      architects,
      projects,
      activeProjects: activeProjectCount,
      attentionProjects: attentionProjectCount,
    },
    recentSubmittedProjects: recentSubmittedProjects.map((project) => ({
      id: project._id.toString(),
      name: project.name,
      submittedAt: project.submittedAt?.toISOString() ?? new Date().toISOString(),
    })),
  };
}
