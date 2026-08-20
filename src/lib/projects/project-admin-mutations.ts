import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import { assertAllowedTransition } from "@/lib/projects/project-status-transitions";
import {
  buildReviewHistoryEntry,
  createReviewEventId,
} from "@/lib/projects/project-review-history";
import { createWorkflowNotification } from "@/lib/notifications/createWorkflowNotification";
import { assertQuoteApprovalGate } from "@/lib/quotes/quote-mutations";
import { QuoteMutationError } from "@/lib/quotes/quote-errors";
import { supersedeActiveQuotes } from "@/lib/quotes/supersedeActiveQuotes";
import type { NotificationType } from "@/types/notification";
import type { ProjectStatus } from "@/types/project";

type AdminReviewTransition = {
  toStatus: Extract<ProjectStatus, "approved" | "changes_requested" | "rejected">;
  action: "approved" | "changes_requested" | "rejected";
  notificationType: NotificationType;
  message?: string;
};

async function applyAdminReviewTransition(
  adminUserId: string,
  projectId: string,
  transition: AdminReviewTransition,
): Promise<void> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    status: "submitted",
  }).select("_id ownerUserId name status commercialDirty");

  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (project.commercialDirty) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_SUBMITTABLE);
  }

  const fromStatus: ProjectStatus = "submitted";
  assertAllowedTransition(fromStatus, transition.toStatus, "admin");

  const reviewEventId = createReviewEventId();
  const now = new Date();
  const historyEntry = buildReviewHistoryEntry({
    reviewEventId,
    action: transition.action,
    fromStatus,
    toStatus: transition.toStatus,
    actorUserId: adminUserId,
    actorRole: "admin",
    message: transition.message,
  });

  const result = await Project.updateOne(
    {
      _id: new Types.ObjectId(projectId),
      status: fromStatus,
    },
    {
      $set: {
        status: transition.toStatus,
        reviewedAt: now,
        reviewedByUserId: new Types.ObjectId(adminUserId),
        commercialDirty: false,
      },
      $push: {
        reviewHistory: historyEntry,
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (
    transition.action === "changes_requested" ||
    transition.action === "rejected"
  ) {
    await supersedeActiveQuotes(
      projectId,
      transition.action === "rejected" ? "reject" : "request_changes",
    );
  }

  await createWorkflowNotification({
    recipientUserId: project.ownerUserId.toString(),
    type: transition.notificationType,
    projectId: project._id.toString(),
    reviewHistoryId: reviewEventId.toString(),
    projectNameSnapshot: project.name,
    message: transition.message,
  });
}

export async function approveProject(
  adminUserId: string,
  projectId: string,
  note?: string,
): Promise<void> {
  try {
    await assertQuoteApprovalGate(projectId);
  } catch (error: unknown) {
    if (error instanceof QuoteMutationError) {
      throw new ProjectMutationError(error.message);
    }
    throw error;
  }

  await applyAdminReviewTransition(adminUserId, projectId, {
    toStatus: "approved",
    action: "approved",
    notificationType: "PROJECT_APPROVED",
    message: note,
  });
}

export async function requestProjectChanges(
  adminUserId: string,
  projectId: string,
  message: string,
): Promise<void> {
  await applyAdminReviewTransition(adminUserId, projectId, {
    toStatus: "changes_requested",
    action: "changes_requested",
    notificationType: "PROJECT_CHANGES_REQUESTED",
    message,
  });
}

export async function rejectProject(
  adminUserId: string,
  projectId: string,
  reason: string,
): Promise<void> {
  await applyAdminReviewTransition(adminUserId, projectId, {
    toStatus: "rejected",
    action: "rejected",
    notificationType: "PROJECT_REJECTED",
    message: reason,
  });
}
