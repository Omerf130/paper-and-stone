import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import { assertAllowedTransition } from "@/lib/projects/project-status-transitions";
import { buildReviewHistoryEntry } from "@/lib/projects/project-review-history";
import type { ProjectStatus } from "@/types/project";

type AdminReviewTransition = {
  toStatus: Extract<ProjectStatus, "approved" | "changes_requested" | "rejected">;
  action: "approved" | "changes_requested" | "rejected";
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

  const fromStatus: ProjectStatus = "submitted";
  assertAllowedTransition(fromStatus, transition.toStatus, "admin");

  const now = new Date();
  const historyEntry = buildReviewHistoryEntry({
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
      },
      $push: {
        reviewHistory: historyEntry,
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }
}

export async function approveProject(
  adminUserId: string,
  projectId: string,
  note?: string,
): Promise<void> {
  await applyAdminReviewTransition(adminUserId, projectId, {
    toStatus: "approved",
    action: "approved",
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
    message: reason,
  });
}
