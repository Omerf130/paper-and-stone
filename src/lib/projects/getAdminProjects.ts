import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { escapeRegex } from "@/lib/catalog/escape-regex";
import { calculatePagination } from "@/lib/catalog/catalog-pagination";
import Project from "@/models/Project";
import User from "@/models/User";
import ProfessionalProfile from "@/models/ProfessionalProfile";
import type { IProject } from "@/models/Project";
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

type AdminProjectsFilter = Record<string, unknown>;

export function buildAdminProjectsFilter(
  params: Pick<AdminProjectsParams, "queue" | "status">,
): AdminProjectsFilter {
  if (params.queue === "onboarding") {
    return { onboardingStatus: "pending_approval" };
  }

  return {
    $and: [
      { status: params.status },
      {
        $or: [
          { onboardingStatus: null },
          { onboardingStatus: { $exists: false } },
        ],
      },
    ],
  };
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

export async function getAdminProjects(
  params: AdminProjectsParams,
  adminUserId: string,
): Promise<AdminProjectsPageResult> {
  await connectDB();

  const baseFilter = buildAdminProjectsFilter(params);

  let filter: AdminProjectsFilter = baseFilter;

  if (params.query) {
    const regex = escapeRegex(params.query);
    const matchingUsers = await User.find({
      email: { $regex: regex, $options: "i" },
    })
      .select("_id")
      .lean();

    const ownerIdsFromEmail = matchingUsers.map((user) => user._id);
    const searchOr: AdminProjectsFilter[] = [
      { name: { $regex: regex, $options: "i" } },
      { clientName: { $regex: regex, $options: "i" } },
    ];

    if (ownerIdsFromEmail.length > 0) {
      searchOr.push({ ownerUserId: { $in: ownerIdsFromEmail } });
    }

    filter = {
      $and: [
        ...(Array.isArray(baseFilter.$and)
          ? baseFilter.$and
          : [baseFilter]),
        { $or: searchOr },
      ],
    };
  }

  const total = await Project.countDocuments(filter);
  const pagination = calculatePagination({
    total,
    page: params.page,
    pageSize: PROJECTS_PAGE_SIZE,
  });

  const projects = (await Project.find(filter)
    .sort(
      params.queue === "onboarding"
        ? { updatedAt: -1 }
        : { submittedAt: -1, updatedAt: -1 },
    )
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
  const [emailsByOwnerId, namesByOwnerId, unreadCounts, quoteSummaries] =
    await Promise.all([
    resolveOwnerEmails(ownerUserIds),
    resolveOwnerNames(ownerUserIds),
    getUnreadMessageCountsForProjects(projectIds, adminUserId, "admin"),
    getAdminProjectQuoteStatusSummaries(projectIds),
  ]);

  return Promise.all(
    projects.map(async (project) => {
      const projectId = project._id.toString();
      const quoteSummary = quoteSummaries.get(projectId);
      const ownerId = project.ownerUserId.toString();

      return {
        ...(await mapLeanProjectToAdminListItem(
          project,
          emailsByOwnerId.get(ownerId) ?? "—",
          namesByOwnerId.get(ownerId),
        )),
        unreadMessageCount: unreadCounts.get(projectId) ?? 0,
        quoteStatusLabel: quoteSummary?.quoteStatusLabel,
        quoteAttention: quoteSummary?.quoteAttention,
      };
    }),
  );
}

export async function getAdminProjectDetailView(
  projectId: string,
): Promise<AdminProjectDetailView | null> {
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

  return mapLeanProjectToAdminDetailView(
    project,
    emailsByOwnerId.get(ownerUserId) ?? "—",
    namesByOwnerId.get(ownerUserId),
  );
}
