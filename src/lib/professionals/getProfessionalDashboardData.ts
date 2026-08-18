import { Types } from "mongoose";
import type { IProject, IProjectItem } from "@/models/Project";
import type {
  ProfessionalDashboardData,
  ProfessionalDashboardProject,
} from "@/types/professional-dashboard";
import { PROFESSIONAL_DASHBOARD_PROJECT_LIMIT } from "@/types/professional-dashboard";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import {
  getDisplayName,
  getProfileCompletenessSummary,
} from "@/lib/professionals/profile-completeness";
import { getMyProfessionalProfileView } from "@/lib/professionals/ensureProfessionalProfile";
import { getUnreadNotificationCount } from "@/lib/notifications/notification-queries";
import { getUnreadProfessionalProjectMessageCount } from "@/lib/project-messages/getUnreadProfessionalProjectMessageCount";
import { getUnreadMessageCountsForProjects } from "@/lib/project-messages/getUnreadMessageCountsForProjects";
import { mapProjectToListItemView } from "@/lib/projects/mapProjectToView";
import { getProjectRoomCountsByProjectIds } from "@/lib/projects/project-room-queries";
import { getArchitectProjectActionHint } from "@/lib/projects/architect-project-attention";
import type { ProjectStatus } from "@/types/project";

const DASHBOARD_LIMIT = PROFESSIONAL_DASHBOARD_PROJECT_LIMIT;

type LeanProject = Pick<
  IProject,
  "_id" | "name" | "clientName" | "status" | "updatedAt" | "items" | "onboardingStatus" | "clientUserId"
>;

function mapLeanProjectToDashboardProject(
  project: LeanProject,
  unreadMessageCount: number,
  roomCount?: number,
  actionHint?: string | null,
): ProfessionalDashboardProject {
  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
    status: project.status,
    itemCount: project.items.length,
    roomCount,
    actionHint,
    updatedAt: project.updatedAt.toISOString(),
    unreadMessageCount,
  };
}

function buildArchitectAttentionItems(items: IProjectItem[]) {
  return items.map((item) => ({
    architectPricing: item.pricing
      ? {
          architectPriceAgorot: item.pricing.architectPriceAgorot,
          clientPriceAgorot: item.pricing.clientPriceAgorot,
          clientPriceStale: item.pricing.clientPriceStale,
        }
      : undefined,
  }));
}

export function mergePriorityDashboardProjects(
  groups: {
    stalePricing: LeanProject[];
    changesRequested: LeanProject[];
    rejectedOnboarding: LeanProject[];
    pendingOnboarding: LeanProject[];
    drafts: LeanProject[];
    submitted: LeanProject[];
    finalized: LeanProject[];
  },
  unreadCounts: Map<string, number>,
  roomCounts: Map<string, number>,
  limit = DASHBOARD_LIMIT,
): ProfessionalDashboardProject[] {
  const orderedGroups = [
    groups.stalePricing,
    groups.changesRequested,
    groups.rejectedOnboarding,
    groups.pendingOnboarding,
    groups.drafts,
    groups.submitted,
    groups.finalized,
  ];

  const seen = new Set<string>();
  const result: ProfessionalDashboardProject[] = [];

  for (const group of orderedGroups) {
    for (const project of group) {
      const id = project._id.toString();
      if (seen.has(id)) {
        continue;
      }

      seen.add(id);
      result.push(
        mapLeanProjectToDashboardProject(
          project,
          unreadCounts.get(id) ?? 0,
          roomCounts.get(id),
          getArchitectProjectActionHint({
            onboardingStatus: project.onboardingStatus ?? null,
            status: project.status,
            items: buildArchitectAttentionItems(project.items),
          }),
        ),
      );

      if (result.length >= limit) {
        return result;
      }
    }
  }

  return result;
}

export async function getProfessionalDashboardData(
  ownerUserId: string,
  userEmail: string,
): Promise<ProfessionalDashboardData> {
  await connectDB();

  const ownerObjectId = new Types.ObjectId(ownerUserId);
  const projectSelect =
    "_id name clientName status updatedAt items onboardingStatus clientUserId";

  const [
    profile,
    unreadNotificationCount,
    unreadMessageCount,
    changesRequestedCount,
    stalePricingProjectCount,
    pendingOnboardingCount,
    activeProjectCount,
    submittedProjectCount,
    stalePricingProjects,
    changesRequestedProjects,
    rejectedOnboardingProjects,
    pendingOnboardingProjects,
    draftProjects,
    submittedProjects,
    finalizedProjects,
  ] = await Promise.all([
    getMyProfessionalProfileView(ownerUserId),
    getUnreadNotificationCount(ownerUserId),
    getUnreadProfessionalProjectMessageCount(ownerUserId),
    Project.countDocuments({
      ownerUserId: ownerObjectId,
      status: "changes_requested",
    }),
    Project.countDocuments({
      ownerUserId: ownerObjectId,
      onboardingStatus: "active",
      items: { $elemMatch: { "pricing.clientPriceStale": true } },
    }),
    Project.countDocuments({
      ownerUserId: ownerObjectId,
      onboardingStatus: "pending_approval",
    }),
    Project.countDocuments({
      ownerUserId: ownerObjectId,
      onboardingStatus: "active",
    }),
    Project.countDocuments({
      ownerUserId: ownerObjectId,
      status: "submitted",
    }),
    Project.find({
      ownerUserId: ownerObjectId,
      onboardingStatus: "active",
      items: { $elemMatch: { "pricing.clientPriceStale": true } },
    })
      .select(projectSelect)
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_LIMIT)
      .lean(),
    Project.find({ ownerUserId: ownerObjectId, status: "changes_requested" })
      .select(projectSelect)
      .sort({ updatedAt: -1 })
      .lean(),
    Project.find({
      ownerUserId: ownerObjectId,
      onboardingStatus: "rejected",
    })
      .select(projectSelect)
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_LIMIT)
      .lean(),
    Project.find({
      ownerUserId: ownerObjectId,
      onboardingStatus: "pending_approval",
    })
      .select(projectSelect)
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_LIMIT)
      .lean(),
    Project.find({ ownerUserId: ownerObjectId, status: "draft" })
      .select(projectSelect)
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_LIMIT)
      .lean(),
    Project.find({ ownerUserId: ownerObjectId, status: "submitted" })
      .select(projectSelect)
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_LIMIT)
      .lean(),
    Project.find({
      ownerUserId: ownerObjectId,
      status: { $in: ["approved", "rejected"] satisfies ProjectStatus[] },
    })
      .select(projectSelect)
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_LIMIT)
      .lean(),
  ]);

  const attentionProjectCount =
    stalePricingProjectCount +
    changesRequestedCount +
    pendingOnboardingCount +
    (await Project.countDocuments({
      ownerUserId: ownerObjectId,
      onboardingStatus: "rejected",
    }));

  const allCandidates = [
    ...stalePricingProjects,
    ...changesRequestedProjects,
    ...rejectedOnboardingProjects,
    ...pendingOnboardingProjects,
    ...draftProjects,
    ...submittedProjects,
    ...finalizedProjects,
  ] as LeanProject[];

  const candidateIds = [...new Set(allCandidates.map((project) => project._id.toString()))];

  const [unreadCounts, roomCounts] = await Promise.all([
    getUnreadMessageCountsForProjects(candidateIds, ownerUserId, "professional"),
    getProjectRoomCountsByProjectIds(candidateIds),
  ]);

  const mergedProjects = mergePriorityDashboardProjects(
    {
      stalePricing: stalePricingProjects as LeanProject[],
      changesRequested: changesRequestedProjects as LeanProject[],
      rejectedOnboarding: rejectedOnboardingProjects as LeanProject[],
      pendingOnboarding: pendingOnboardingProjects as LeanProject[],
      drafts: draftProjects as LeanProject[],
      submitted: submittedProjects as LeanProject[],
      finalized: finalizedProjects as LeanProject[],
    },
    unreadCounts,
    roomCounts,
  );

  const dashboardProjects = await Promise.all(
    mergedProjects.map(async (project) => {
      const source = allCandidates.find(
        (candidate) => candidate._id.toString() === project.id,
      );

      if (!source) {
        return project;
      }

      const listView = await mapProjectToListItemView(source as IProject);

      return {
        ...project,
        clientName: listView.clientName,
        assignedClientFullName: listView.assignedClientFullName,
        onboardingStatus: listView.onboardingStatus,
      };
    }),
  );

  return {
    displayName: getDisplayName(profile, userEmail),
    unreadNotificationCount,
    unreadMessageCount,
    changesRequestedCount,
    attentionProjectCount,
    stalePricingProjectCount,
    pendingOnboardingCount,
    activeProjectCount,
    submittedProjectCount,
    profileCompleteness: getProfileCompletenessSummary(profile),
    dashboardProjects,
  };
}
