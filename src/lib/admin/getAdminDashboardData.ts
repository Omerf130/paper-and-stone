import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import Product from "@/models/Product";
import {
  countApprovedActiveArchitects,
  countApprovedActiveClients,
} from "@/lib/admin/admin-dashboard-metrics";
import { buildAdminDashboardActivityFeed } from "@/lib/admin/buildAdminDashboardActivityFeed";
import { getUnreadAdminProjectMessageCount } from "@/lib/project-messages/getUnreadAdminProjectMessageCount";
import { loadProductThumbnailMap } from "@/lib/products/loadProductThumbnailMap";
import { getAdminQuoteAttentionSummary } from "@/lib/quotes/quote-queries";
import {
  getActiveProjectCount,
  getAdminProjectAttentionCount,
  getAdminProjectsQueueSummary,
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
    recentProjectsRaw,
    activityFeed,
    queueSummary,
    recentProductsRaw,
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
    Project.aggregate([
      { $sort: { updatedAt: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          status: 1,
          updatedAt: 1,
          location: 1,
          itemCount: { $size: { $ifNull: ["$items", []] } },
        },
      },
    ]),
    buildAdminDashboardActivityFeed(),
    getAdminProjectsQueueSummary(),
    Product.find({})
      .sort({ updatedAt: -1 })
      .limit(4)
      .select("nameHe sku updatedAt")
      .lean(),
  ]);

  const recentProjects = recentProjectsRaw.map((project) => ({
    id: project._id.toString(),
    name: project.name as string,
    status: project.status as string,
    updatedAt: (project.updatedAt as Date).toISOString(),
    location: (project.location as string | undefined)?.trim() || undefined,
    itemCount: (project.itemCount as number) ?? 0,
  }));

  const recentProducts = recentProductsRaw.map((product) => ({
    id: product._id.toString(),
    nameHe: product.nameHe,
    sku: product.sku,
    updatedAt: product.updatedAt.toISOString(),
  }));

  const productThumbnailsById = await loadProductThumbnailMap(
    recentProducts.map((product) => product.id),
  );

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
    recentProjects,
    recentSubmittedProjects: recentProjects,
    activityFeed,
    queueSummary,
    recentProducts,
    productThumbnailsById,
  };
}
