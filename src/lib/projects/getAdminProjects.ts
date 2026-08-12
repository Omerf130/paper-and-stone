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
import type { ProjectStatus } from "@/types/project";
import { getUnreadMessageCountsForProjects } from "@/lib/project-messages/getUnreadMessageCountsForProjects";

type AdminProjectsFilter = {
  status: ProjectStatus;
  $or?: Array<Record<string, unknown>>;
};

export function buildAdminProjectsFilter(
  params: AdminProjectsParams,
): AdminProjectsFilter {
  const filter: AdminProjectsFilter = {
    status: params.status,
  };

  if (params.query) {
    const regex = escapeRegex(params.query);
    filter.$or = [
      { name: { $regex: regex, $options: "i" } },
      { clientName: { $regex: regex, $options: "i" } },
    ];
  }

  return filter;
}

async function resolveOwnerEmails(
  ownerUserIds: string[],
): Promise<Map<string, string>> {
  if (ownerUserIds.length === 0) {
    return new Map();
  }

  const users = await User.find({ _id: { $in: ownerUserIds } })
    .select("_id email")
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

  const profiles = await ProfessionalProfile.find({
    userId: { $in: ownerUserIds },
  })
    .select("userId fullName")
    .lean();

  return new Map(
    profiles
      .filter((profile): profile is typeof profile & { fullName: string } =>
        Boolean(profile.fullName?.trim()),
      )
      .map((profile) => [profile.userId.toString(), profile.fullName.trim()]),
  );
}

export async function getAdminProjects(
  params: AdminProjectsParams,
  adminUserId: string,
): Promise<AdminProjectsPageResult> {
  await connectDB();

  const filter = buildAdminProjectsFilter(params);

  let total: number;
  let projects: IProject[];

  if (params.query) {
    const regex = escapeRegex(params.query);
    const matchingUsers = await User.find({
      email: { $regex: regex, $options: "i" },
    })
      .select("_id")
      .lean();

    const ownerIdsFromEmail = matchingUsers.map((user) => user._id);

    const combinedFilter = {
      status: params.status,
      $or: [
        ...(filter.$or ?? []),
        ...(ownerIdsFromEmail.length > 0
          ? [{ ownerUserId: { $in: ownerIdsFromEmail } }]
          : []),
      ],
    };

    total = await Project.countDocuments(combinedFilter);
    const pagination = calculatePagination({
      total,
      page: params.page,
      pageSize: PROJECTS_PAGE_SIZE,
    });

    projects = (await Project.find(combinedFilter)
      .sort({ submittedAt: -1, updatedAt: -1 })
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

  total = await Project.countDocuments(filter);
  const pagination = calculatePagination({
    total,
    page: params.page,
    pageSize: PROJECTS_PAGE_SIZE,
  });

  projects = (await Project.find(filter)
    .sort({ submittedAt: -1, updatedAt: -1 })
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
  const [emailsByOwnerId, namesByOwnerId, unreadCounts] = await Promise.all([
    resolveOwnerEmails(ownerUserIds),
    resolveOwnerNames(ownerUserIds),
    getUnreadMessageCountsForProjects(projectIds, adminUserId, "admin"),
  ]);

  return projects.map((project) => ({
    ...mapLeanProjectToAdminListItem(
      project,
      emailsByOwnerId.get(project.ownerUserId.toString()) ?? "—",
      namesByOwnerId.get(project.ownerUserId.toString()),
    ),
    unreadMessageCount: unreadCounts.get(project._id.toString()) ?? 0,
  }));
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
