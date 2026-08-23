import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Color from "@/models/Color";
import Material from "@/models/Material";
import Product from "@/models/Product";
import Project from "@/models/Project";
import User from "@/models/User";
import { ARCHITECT_ROLE_FILTER } from "@/lib/auth/user-role";
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
    activeProducts,
    featuredProducts,
    activeCategories,
    activeMaterials,
    activeColors,
    activeArchitects,
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
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isFeatured: true }),
    Category.countDocuments({ isActive: true }),
    Material.countDocuments({ isActive: true }),
    Color.countDocuments({ isActive: true }),
    User.countDocuments({ role: ARCHITECT_ROLE_FILTER, isActive: true }),
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
      activeProducts,
      featuredProducts,
      activeCategories,
      activeMaterials,
      activeColors,
      activeArchitects,
    },
    recentSubmittedProjects: recentSubmittedProjects.map((project) => ({
      id: project._id.toString(),
      name: project.name,
      submittedAt: project.submittedAt?.toISOString() ?? new Date().toISOString(),
    })),
  };
}
