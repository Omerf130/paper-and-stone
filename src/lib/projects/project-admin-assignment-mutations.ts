import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project, { type IProject } from "@/models/Project";
import { verifyClientEligibleForAssignment } from "@/lib/admin/clients/verifyClientEligibleForAssignment";
import { verifyArchitectEligibleForProjectOwnership } from "@/lib/admin/architects/architect-lookup-queries";
import { createWorkflowNotification } from "@/lib/notifications/createWorkflowNotification";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { ONBOARDING_ERRORS } from "@/lib/projects/project-onboarding-mutations";
import {
  buildReviewHistoryEntry,
  createReviewEventId,
} from "@/lib/projects/project-review-history";
import { deleteClientApprovedProjectSnapshot } from "@/lib/client-snapshots/client-approved-project-snapshot-repository";
import { CRM_ERRORS } from "@/types/admin-crm";

async function findAdminAssignableProject(projectId: string): Promise<IProject> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    onboardingStatus: "active",
    status: { $nin: ["rejected"] },
  });

  if (!project) {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_ACTIVE);
  }

  return project;
}

export async function reassignProjectArchitect(
  adminUserId: string,
  projectId: string,
  architectUserId: string,
): Promise<void> {
  const project = await findAdminAssignableProject(projectId);

  if (project.ownerUserId.toString() === architectUserId) {
    throw new ProjectMutationError(CRM_ERRORS.SAME_ARCHITECT);
  }

  await verifyArchitectEligibleForProjectOwnership(architectUserId);

  const reviewEventId = createReviewEventId();
  const historyEntry = buildReviewHistoryEntry({
    reviewEventId,
    action: "onboarding_architect_reassigned",
    fromStatus: project.status,
    toStatus: project.status,
    actorUserId: adminUserId,
    actorRole: "admin",
  });

  const oldOwnerUserId = project.ownerUserId.toString();

  const result = await Project.updateOne(
    {
      _id: project._id,
      onboardingStatus: "active",
    },
    {
      $set: {
        ownerUserId: new Types.ObjectId(architectUserId),
      },
      $push: {
        reviewHistory: historyEntry,
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_ACTIVE);
  }

  await createWorkflowNotification({
    recipientUserId: architectUserId,
    type: "PROJECT_ONBOARDING_APPROVED",
    projectId: project._id.toString(),
    reviewHistoryId: reviewEventId.toString(),
    projectNameSnapshot: project.name,
  });

  if (oldOwnerUserId !== architectUserId) {
    await createWorkflowNotification({
      recipientUserId: oldOwnerUserId,
      type: "PROJECT_ONBOARDING_REJECTED",
      projectId: project._id.toString(),
      reviewHistoryId: reviewEventId.toString(),
      projectNameSnapshot: project.name,
      message: "הפרויקט הועבר לאדריכל אחר.",
    });
  }
}

export async function reassignProjectClientAsAdmin(
  adminUserId: string,
  projectId: string,
  clientUserId: string,
): Promise<void> {
  const project = await findAdminAssignableProject(projectId);
  await verifyClientEligibleForAssignment(clientUserId);

  const now = new Date();
  const historyEntry = buildReviewHistoryEntry({
    action: "onboarding_client_reassigned",
    fromStatus: project.status,
    toStatus: project.status,
    actorUserId: adminUserId,
    actorRole: "admin",
  });

  const result = await Project.updateOne(
    {
      _id: project._id,
      onboardingStatus: "active",
    },
    {
      $set: {
        clientUserId: new Types.ObjectId(clientUserId),
        clientAssignedAt: now,
        clientAssignedByUserId: new Types.ObjectId(adminUserId),
      },
      $push: {
        reviewHistory: historyEntry,
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_ACTIVE);
  }

  await deleteClientApprovedProjectSnapshot(projectId);

  if (project.status === "approved") {
    await Project.updateOne(
      { _id: project._id },
      {
        $set: {
          commercialDirty: true,
          commercialDirtyAt: now,
        },
      },
    );
  }
}
