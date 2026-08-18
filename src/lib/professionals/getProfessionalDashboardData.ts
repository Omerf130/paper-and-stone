import { Types } from "mongoose";
import type { IProject } from "@/models/Project";
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
import type { ProjectStatus } from "@/types/project";

const DASHBOARD_LIMIT = PROFESSIONAL_DASHBOARD_PROJECT_LIMIT;

type LeanProject = {
  _id: IProject["_id"];
  name: string;
  clientName?: string;
  status: ProjectStatus;
  updatedAt: Date;
  items: unknown[];
};

function mapLeanProjectToDashboardProject(
  project: LeanProject,
  unreadMessageCount: number,
): ProfessionalDashboardProject {
  return {
    id: project._id.toString(),
    name: project.name,
    clientName: project.clientName,
    status: project.status,
    itemCount: project.items.length,
    updatedAt: project.updatedAt.toISOString(),
    unreadMessageCount,
  };
}

export function mergePriorityDashboardProjects(
  groups: {
    changesRequested: LeanProject[];
    drafts: LeanProject[];
    submitted: LeanProject[];
    finalized: LeanProject[];
  },
  unreadCounts: Map<string, number>,
  limit = DASHBOARD_LIMIT,
): ProfessionalDashboardProject[] {
  const orderedGroups = [
    groups.changesRequested,
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

  const [
    profile,
    unreadNotificationCount,
    unreadMessageCount,
    changesRequestedCount,
    changesRequestedProjects,
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
    Project.find({ ownerUserId: ownerObjectId, status: "changes_requested" })
      .select("_id name clientName status updatedAt items onboardingStatus clientUserId")
      .sort({ updatedAt: -1 })
      .lean(),
    Project.find({ ownerUserId: ownerObjectId, status: "draft" })
      .select("_id name clientName status updatedAt items onboardingStatus clientUserId")
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_LIMIT)
      .lean(),
    Project.find({ ownerUserId: ownerObjectId, status: "submitted" })
      .select("_id name clientName status updatedAt items onboardingStatus clientUserId")
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_LIMIT)
      .lean(),
    Project.find({
      ownerUserId: ownerObjectId,
      status: { $in: ["approved", "rejected"] satisfies ProjectStatus[] },
    })
      .select("_id name clientName status updatedAt items onboardingStatus clientUserId")
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_LIMIT)
      .lean(),
  ]);

  const candidateIds = [
    ...changesRequestedProjects,
    ...draftProjects,
    ...submittedProjects,
    ...finalizedProjects,
  ].map((project) => project._id.toString());

  const unreadCounts = await getUnreadMessageCountsForProjects(
    candidateIds,
    ownerUserId,
    "professional",
  );

  const mergedProjects = mergePriorityDashboardProjects(
    {
      changesRequested: changesRequestedProjects as LeanProject[],
      drafts: draftProjects as LeanProject[],
      submitted: submittedProjects as LeanProject[],
      finalized: finalizedProjects as LeanProject[],
    },
    unreadCounts,
  );

  const dashboardProjects = await Promise.all(
    mergedProjects.map(async (project) => {
      const source = [
        ...changesRequestedProjects,
        ...draftProjects,
        ...submittedProjects,
        ...finalizedProjects,
      ].find((candidate) => candidate._id.toString() === project.id);

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
    profileCompleteness: getProfileCompletenessSummary(profile),
    dashboardProjects,
  };
}
