import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Color from "@/models/Color";
import Material from "@/models/Material";
import Product from "@/models/Product";
import Project from "@/models/Project";
import User from "@/models/User";
import { getUnreadAdminProjectMessageCount } from "@/lib/project-messages/getUnreadAdminProjectMessageCount";
import { getAdminQuoteAttentionSummary } from "@/lib/quotes/quote-queries";
import type { AdminDashboardData } from "@/types/admin-dashboard";

export async function getAdminDashboardData(
  adminUserId: string,
): Promise<AdminDashboardData> {
  await connectDB();

  const [
    submittedProjectCount,
    unreadAdminMessageCount,
    quoteAttention,
    activeProducts,
    featuredProducts,
    activeCategories,
    activeMaterials,
    activeColors,
    activeProfessionals,
    recentSubmittedProjects,
  ] = await Promise.all([
    Project.countDocuments({ status: "submitted" }),
    getUnreadAdminProjectMessageCount(adminUserId),
    getAdminQuoteAttentionSummary(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isFeatured: true }),
    Category.countDocuments({ isActive: true }),
    Material.countDocuments({ isActive: true }),
    Color.countDocuments({ isActive: true }),
    User.countDocuments({ role: "professional", isActive: true }),
    Project.find({ status: "submitted" })
      .sort({ submittedAt: -1 })
      .limit(5)
      .select("name submittedAt")
      .lean(),
  ]);

  return {
    submittedProjectCount,
    unreadAdminMessageCount,
    quoteAcceptedAwaitingApprovalCount:
      quoteAttention.quoteAcceptedAwaitingApprovalCount,
    quoteChangeRequestedCount: quoteAttention.quoteChangeRequestedCount,
    quoteAwaitingProfessionalCount:
      quoteAttention.quoteAwaitingProfessionalCount,
    metrics: {
      activeProducts,
      featuredProducts,
      activeCategories,
      activeMaterials,
      activeColors,
      activeProfessionals,
    },
    recentSubmittedProjects: recentSubmittedProjects.map((project) => ({
      id: project._id.toString(),
      name: project.name,
      submittedAt: project.submittedAt?.toISOString() ?? new Date().toISOString(),
    })),
  };
}
