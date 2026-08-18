import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project, { type IProject } from "@/models/Project";
import { verifyClientEligibleForAssignment } from "@/lib/admin/clients/verifyClientEligibleForAssignment";
import { createWorkflowNotification } from "@/lib/notifications/createWorkflowNotification";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  buildReviewHistoryEntry,
  createReviewEventId,
} from "@/lib/projects/project-review-history";

export const ONBOARDING_ERRORS = {
  NOT_FOUND: "הפרויקט לא נמצא.",
  NOT_PENDING: "הפרויקט אינו ממתין לאישור פתיחה.",
  NOT_REJECTED: "לא ניתן לשלוח מחדש פרויקט שאינו במצב נדחה.",
  NOT_ACTIVE: "הפרויקט אינו פעיל.",
  FORBIDDEN: "אין הרשאה לבצע פעולה זו.",
  CLIENT_REQUIRED: "יש לבחור לקוח לפני אישור הפרויקט.",
} as const;

async function findOwnedOnboardingProject(
  projectId: string,
  ownerUserId?: string,
): Promise<IProject> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_FOUND);
  }

  const filter: Record<string, unknown> = {
    _id: new Types.ObjectId(projectId),
  };

  if (ownerUserId) {
    filter.ownerUserId = new Types.ObjectId(ownerUserId);
  }

  const project = await Project.findOne(filter);

  if (!project) {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_FOUND);
  }

  return project;
}

async function notifyOnboardingEvent(
  project: IProject,
  reviewHistoryId: Types.ObjectId,
  type: "PROJECT_ONBOARDING_APPROVED" | "PROJECT_ONBOARDING_REJECTED",
  message?: string,
): Promise<void> {
  await createWorkflowNotification({
    recipientUserId: project.ownerUserId.toString(),
    type,
    projectId: project._id.toString(),
    reviewHistoryId: reviewHistoryId.toString(),
    projectNameSnapshot: project.name,
    message,
  });
}

export async function approveProjectOnboarding(
  adminUserId: string,
  projectId: string,
  clientUserId: string,
): Promise<void> {
  if (!clientUserId?.trim()) {
    throw new ProjectMutationError(ONBOARDING_ERRORS.CLIENT_REQUIRED);
  }

  const project = await findOwnedOnboardingProject(projectId);

  if (
    project.onboardingStatus === "active" &&
    project.clientUserId?.toString() === clientUserId
  ) {
    return;
  }

  if (project.onboardingStatus !== "pending_approval") {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_PENDING);
  }

  await verifyClientEligibleForAssignment(clientUserId);

  const now = new Date();
  const reviewEventId = createReviewEventId();
  const historyEntry = buildReviewHistoryEntry({
    reviewEventId,
    action: "onboarding_approved",
    fromStatus: project.status,
    toStatus: project.status,
    actorUserId: adminUserId,
    actorRole: "admin",
  });

  const result = await Project.updateOne(
    {
      _id: project._id,
      onboardingStatus: "pending_approval",
    },
    {
      $set: {
        onboardingStatus: "active",
        clientUserId: new Types.ObjectId(clientUserId),
        clientAssignedAt: now,
        clientAssignedByUserId: new Types.ObjectId(adminUserId),
        onboardingApprovedAt: now,
        onboardingApprovedByUserId: new Types.ObjectId(adminUserId),
      },
      $push: {
        reviewHistory: historyEntry,
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_PENDING);
  }

  await notifyOnboardingEvent(project, reviewEventId, "PROJECT_ONBOARDING_APPROVED");
}

export async function rejectProjectOnboarding(
  adminUserId: string,
  projectId: string,
  reason?: string,
): Promise<void> {
  const project = await findOwnedOnboardingProject(projectId);

  if (project.onboardingStatus === "rejected") {
    return;
  }

  if (project.onboardingStatus !== "pending_approval") {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_PENDING);
  }

  const reviewEventId = createReviewEventId();
  const historyEntry = buildReviewHistoryEntry({
    reviewEventId,
    action: "onboarding_rejected",
    fromStatus: project.status,
    toStatus: project.status,
    actorUserId: adminUserId,
    actorRole: "admin",
    message: reason,
  });

  const result = await Project.updateOne(
    {
      _id: project._id,
      onboardingStatus: "pending_approval",
    },
    {
      $set: {
        onboardingStatus: "rejected",
      },
      $push: {
        reviewHistory: historyEntry,
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_PENDING);
  }

  await notifyOnboardingEvent(
    project,
    reviewEventId,
    "PROJECT_ONBOARDING_REJECTED",
    reason,
  );
}

export async function resubmitProjectOnboarding(
  ownerUserId: string,
  projectId: string,
): Promise<void> {
  const project = await findOwnedOnboardingProject(projectId, ownerUserId);

  if (project.onboardingStatus !== "rejected") {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_REJECTED);
  }

  const historyEntry = buildReviewHistoryEntry({
    action: "onboarding_resubmitted",
    fromStatus: project.status,
    toStatus: project.status,
    actorUserId: ownerUserId,
    actorRole: "professional",
  });

  const result = await Project.updateOne(
    {
      _id: project._id,
      ownerUserId: new Types.ObjectId(ownerUserId),
      onboardingStatus: "rejected",
    },
    {
      $set: {
        onboardingStatus: "pending_approval",
      },
      $push: {
        reviewHistory: historyEntry,
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_REJECTED);
  }
}

export async function reassignProjectClient(
  adminUserId: string,
  projectId: string,
  clientUserId: string,
): Promise<void> {
  const project = await findOwnedOnboardingProject(projectId);

  if (project.onboardingStatus !== "active") {
    throw new ProjectMutationError(ONBOARDING_ERRORS.NOT_ACTIVE);
  }

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
}

export async function countPendingOnboardingProjects(): Promise<number> {
  await connectDB();
  return Project.countDocuments({ onboardingStatus: "pending_approval" });
}
