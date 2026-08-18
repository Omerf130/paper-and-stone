import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { calculatePagination } from "@/lib/catalog/catalog-pagination";
import Project from "@/models/Project";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import type { IProject } from "@/models/Project";
import {
  buildAdminProjectAttentionFilter,
  getAdminProjectAttentionLabels,
  getProjectPricingAttention,
} from "@/lib/projects/admin-project-attention";
import {
  buildAdminProjectSearchOrClause,
  resolveAdminProjectSearchMatchIds,
} from "@/lib/projects/admin-project-search";
import {
  PROJECTS_PAGE_SIZE,
  type AdminProjectsParams,
} from "@/lib/projects/project-params";
import {
  mapLeanProjectToAdminDetailView,
  mapLeanProjectToAdminListItem,
} from "@/lib/projects/mapProjectToAdminView";
import type {
  AdminProjectDetailView,
  AdminProjectsPageResult,
} from "@/types/admin-project";
import { getUnreadMessageCountsForProjects } from "@/lib/project-messages/getUnreadMessageCountsForProjects";
import { getAdminProjectQuoteStatusSummaries } from "@/lib/quotes/quote-queries";
import { getProjectRoomCountsByProjectIds } from "@/lib/projects/project-room-queries";
import { loadProductThumbnailMap } from "@/lib/products/loadProductThumbnailMap";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";

type AdminProjectsFilter = Record<string, unknown>;

export function buildAdminProjectsFilter(
  params: Pick<AdminProjectsParams, "queue" | "status">,
): AdminProjectsFilter {
  switch (params.queue) {
    case "onboarding":
      return { onboardingStatus: "pending_approval" };
    case "active":
      return { onboardingStatus: "active" };
    case "commercial":
      return { status: params.status };
    case "attention":
    default:
      return buildAdminProjectAttentionFilter();
  }
}

export async function getAdminProjectAttentionCount(): Promise<number> {
  await connectDB();
  return Project.countDocuments(buildAdminProjectAttentionFilter());
}

export async function getActiveProjectCount(): Promise<number> {
  await connectDB();
  return Project.countDocuments({ onboardingStatus: "active" });
}

async function resolveOwnerEmails(
  ownerUserIds: string[],
): Promise<Map<string, string>> {
  if (ownerUserIds.length === 0) {
    return new Map();
  }

  const users = await User.find({ _id: { $in: ownerUserIds } })
    .select("_id email fullName")
    .lean();

  return new Map(
    users.map((user) => [user._id.toString(), user.email]),
  );
}

async function resolveOwnerNames(
  ownerUserIds: string[],
): Promise<Map<string, string>> {
  if (ownerUserIds.length === 0) {
    return new Map();
  }

  const users = await User.find({ _id: { $in: ownerUserIds } })
    .select("_id fullName email")
    .lean();

  const names = new Map<string, string>();

  for (const user of users) {
    if (user.fullName?.trim()) {
      names.set(user._id.toString(), user.fullName.trim());
      continue;
    }

    const profile = await ProfessionalProfile.findOne({ userId: user._id })
      .select("fullName")
      .lean();

    if (profile?.fullName?.trim()) {
      names.set(user._id.toString(), profile.fullName.trim());
    }
  }

  return names;
}

function normalizeFilterParts(filter: AdminProjectsFilter): AdminProjectsFilter[] {
  if (Array.isArray(filter.$and)) {
    return filter.$and as AdminProjectsFilter[];
  }

  return [filter];
}

export async function getAdminProjects(
  params: AdminProjectsParams,
  adminUserId: string,
): Promise<AdminProjectsPageResult> {
  await connectDB();

  const baseFilter = buildAdminProjectsFilter(params);
  let filter: AdminProjectsFilter = baseFilter;

  if (params.query) {
    const { ownerUserIds, clientUserIds } =
      await resolveAdminProjectSearchMatchIds(params.query);
    const searchOr = buildAdminProjectSearchOrClause({
      query: params.query,
      ownerUserIds,
      clientUserIds,
    });

    filter = {
      $and: [...normalizeFilterParts(baseFilter), searchOr],
    };
  }

  const total = await Project.countDocuments(filter);
  const pagination = calculatePagination({
    total,
    page: params.page,
    pageSize: PROJECTS_PAGE_SIZE,
  });

  const sort: Record<string, 1 | -1> =
    params.queue === "commercial"
      ? { submittedAt: -1, updatedAt: -1 }
      : { updatedAt: -1 };

  const projects = (await Project.find(filter)
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .lean()) as IProject[];

  return {
    projects: await mapProjectsToAdminListItems(projects, adminUserId),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
  };
}

async function mapProjectsToAdminListItems(
  projects: IProject[],
  adminUserId: string,
) {
  const ownerUserIds = [
    ...new Set(projects.map((project) => project.ownerUserId.toString())),
  ];
  const projectIds = projects.map((project) => project._id.toString());
  const [emailsByOwnerId, namesByOwnerId, unreadCounts, quoteSummaries, roomCounts] =
    await Promise.all([
      resolveOwnerEmails(ownerUserIds),
      resolveOwnerNames(ownerUserIds),
      getUnreadMessageCountsForProjects(projectIds, adminUserId, "admin"),
      getAdminProjectQuoteStatusSummaries(projectIds),
      getProjectRoomCountsByProjectIds(projectIds),
    ]);

  return Promise.all(
    projects.map(async (project) => {
      const projectId = project._id.toString();
      const quoteSummary = quoteSummaries.get(projectId);
      const ownerId = project.ownerUserId.toString();
      const roomCount =
        project.onboardingStatus != null
          ? roomCounts.get(projectId) ?? 0
          : 0;

      return {
        ...(await mapLeanProjectToAdminListItem(
          project,
          emailsByOwnerId.get(ownerId) ?? "—",
          namesByOwnerId.get(ownerId),
        )),
        roomCount,
        attentionReasons: getAdminProjectAttentionLabels(project),
        pricingAttention: getProjectPricingAttention(project.items),
        unreadMessageCount: unreadCounts.get(projectId) ?? 0,
        quoteStatusLabel: quoteSummary?.quoteStatusLabel,
        quoteAttention: quoteSummary?.quoteAttention,
      };
    }),
  );
}

export type AdminProjectDetailWithThumbnails = AdminProjectDetailView & {
  productThumbnailsById: Record<string, ProductThumbnailView>;
};

export async function getAdminProjectDetailView(
  projectId: string,
): Promise<AdminProjectDetailView | null> {
  const detail = await getAdminProjectDetailViewWithThumbnails(projectId);
  if (!detail) {
    return null;
  }

  const { productThumbnailsById, ...view } = detail;
  void productThumbnailsById;
  return view;
}

export async function getAdminProjectDetailViewWithThumbnails(
  projectId: string,
): Promise<AdminProjectDetailWithThumbnails | null> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    return null;
  }

  const project = (await Project.findById(projectId).lean()) as IProject | null;

  if (!project) {
    return null;
  }

  const ownerUserId = project.ownerUserId.toString();
  const [emailsByOwnerId, namesByOwnerId] = await Promise.all([
    resolveOwnerEmails([ownerUserId]),
    resolveOwnerNames([ownerUserId]),
  ]);

  const productIds = [
    ...new Set(project.items.map((item) => item.productId.toString())),
  ];
  const productThumbnailsById = await loadProductThumbnailMap(productIds);

  const view = await mapLeanProjectToAdminDetailView(
    project,
    emailsByOwnerId.get(ownerUserId) ?? "—",
    namesByOwnerId.get(ownerUserId),
  );

  return {
    ...view,
    productThumbnailsById,
  };
}
