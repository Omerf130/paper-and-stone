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
import { getUnreadMessageCountsForProjects, getUnreadArchitectClientMessageCountsForProjects } from "@/lib/project-messages/getUnreadMessageCountsForProjects";
import { mapProjectToListItemView } from "@/lib/projects/mapProjectToView";
import { getProjectRoomCountsByProjectIds } from "@/lib/projects/project-room-queries";
import { getArchitectProjectActionHint } from "@/lib/projects/architect-project-attention";
import { countProjectItemsByStatus } from "@/lib/project-items/project-item-workflow-attention";
import type { ProjectStatus } from "@/types/project";

const DASHBOARD_LIMIT = PROFESSIONAL_DASHBOARD_PROJECT_LIMIT;

type LeanProject = Pick<
  IProject,
  | "_id"
  | "name"
  | "clientName"
  | "status"
  | "updatedAt"
  | "items"
  | "onboardingStatus"
  | "clientUserId"
  | "commercialDirty"
>;

function mapLeanProjectToDashboardProject(
  project: LeanProject,
  unreadMessageCount: number,
  unreadClientMessageCount: number,
  roomCount?: number,
  actionHint?: string | null,
): ProfessionalDashboardProject {
  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
    status: project.status,
    commercialDirty: project.commercialDirty ?? false,
    itemCount: project.items.length,
    roomCount,
    actionHint,
    updatedAt: project.updatedAt.toISOString(),
    unreadMessageCount,
    unreadClientMessageCount,
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
    commercialDirty: LeanProject[];
    changesRequested: LeanProject[];
    rejectedOnboarding: LeanProject[];
    pendingOnboarding: LeanProject[];
    drafts: LeanProject[];
    submitted: LeanProject[];
    finalized: LeanProject[];
  },
  unreadCounts: Map<string, number>,
  unreadClientCounts: Map<string, number>,
  roomCounts: Map<string, number>,
  limit = DASHBOARD_LIMIT,
): ProfessionalDashboardProject[] {
  const orderedGroups = [
    groups.stalePricing,
    groups.commercialDirty,
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
          unreadClientCounts.get(id) ?? 0,
          roomCounts.get(id),
          getArchitectProjectActionHint({
            onboardingStatus: project.onboardingStatus ?? null,
            status: project.status,
            commercialDirty: project.commercialDirty ?? false,
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
    "_id name clientName status updatedAt items onboardingStatus clientUserId commercialDirty";

  const [
    profile,
    unreadNotificationCount,
    unreadMessageCount,
    changesRequestedCount,
    stalePricingProjectCount,
    commercialDirtyProjectCount,
    pendingOnboardingCount,
    activeProjectCount,
    submittedProjectCount,
    stalePricingProjects,
    commercialDirtyProjects,
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
      onboardingStatus: "active",
      status: "approved",
      commercialDirty: true,
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
    Project.find({
      ownerUserId: ownerObjectId,
      onboardingStatus: "active",
      status: "approved",
      commercialDirty: true,
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
    commercialDirtyProjectCount +
    changesRequestedCount +
    pendingOnboardingCount +
    (await Project.countDocuments({
      ownerUserId: ownerObjectId,
      onboardingStatus: "rejected",
    }));

  const allCandidates = [
    ...stalePricingProjects,
    ...commercialDirtyProjects,
    ...changesRequestedProjects,
    ...rejectedOnboardingProjects,
    ...pendingOnboardingProjects,
    ...draftProjects,
    ...submittedProjects,
    ...finalizedProjects,
  ] as LeanProject[];

  const candidateIds = [...new Set(allCandidates.map((project) => project._id.toString()))];

  const [unreadCounts, unreadClientCounts, roomCounts] = await Promise.all([
    getUnreadMessageCountsForProjects(candidateIds, ownerUserId, "professional"),
    getUnreadArchitectClientMessageCountsForProjects(
      allCandidates
        .filter((project) => project.clientUserId)
        .map((project) => ({
          projectId: project._id.toString(),
          clientUserId: project.clientUserId!.toString(),
        })),
      ownerUserId,
    ),
    getProjectRoomCountsByProjectIds(candidateIds),
  ]);

  const mergedProjects = mergePriorityDashboardProjects(
    {
      stalePricing: stalePricingProjects as LeanProject[],
      commercialDirty: commercialDirtyProjects as LeanProject[],
      changesRequested: changesRequestedProjects as LeanProject[],
      rejectedOnboarding: rejectedOnboardingProjects as LeanProject[],
      pendingOnboarding: pendingOnboardingProjects as LeanProject[],
      drafts: draftProjects as LeanProject[],
      submitted: submittedProjects as LeanProject[],
      finalized: finalizedProjects as LeanProject[],
    },
    unreadCounts,
    unreadClientCounts,
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

  const workflowStatusProjects = await Project.find({
    ownerUserId: ownerObjectId,
    onboardingStatus: "active",
  })
    .select("items.status")
    .lean();

  let workflowRejectedItemCount = 0;
  let workflowResubmitItemCount = 0;
  let workflowClientReviewItemCount = 0;

  for (const project of workflowStatusProjects) {
    const counts = countProjectItemsByStatus(project.items);
    workflowRejectedItemCount += counts.client_rejected ?? 0;
    workflowResubmitItemCount += counts.resubmit ?? 0;
    workflowClientReviewItemCount += counts.client_review ?? 0;
  }

  return {
    displayName: getDisplayName(profile, userEmail),
    unreadNotificationCount,
    unreadMessageCount,
    changesRequestedCount,
    attentionProjectCount,
    stalePricingProjectCount,
    pendingOnboardingCount,
    commercialDirtyProjectCount,
    unreadClientMessageCount: [...unreadClientCounts.values()].reduce(
      (total, count) => total + count,
      0,
    ),
    activeProjectCount,
    submittedProjectCount,
    workflowRejectedItemCount,
    workflowResubmitItemCount,
    workflowClientReviewItemCount,
    profileCompleteness: getProfileCompletenessSummary(profile),
    dashboardProjects,
  };
}
