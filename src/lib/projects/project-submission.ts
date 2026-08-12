import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import {
  assertAllowedTransition,
  getSubmitAction,
  isSubmittableStatus,
} from "@/lib/projects/project-status-transitions";
import { buildReviewHistoryEntry } from "@/lib/projects/project-review-history";
import { getMyProfessionalProfileView } from "@/lib/professionals/ensureProfessionalProfile";
import { isProfileReadyForProjects } from "@/lib/professionals/profile-readiness";

async function assertProfileReadyForProjects(userId: string): Promise<void> {
  const profile = await getMyProfessionalProfileView(userId);

  if (!isProfileReadyForProjects(profile)) {
    throw new ProjectMutationError(PROJECT_ERRORS.PROFILE_NOT_READY);
  }
}

export async function submitProject(
  ownerUserId: string,
  projectId: string,
): Promise<void> {
  await assertProfileReadyForProjects(ownerUserId);
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  });

  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!isSubmittableStatus(project.status)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_SUBMITTABLE);
  }

  if (project.items.length === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.EMPTY_PROJECT);
  }

  const fromStatus = project.status;
  const toStatus = "submitted";
  assertAllowedTransition(fromStatus, toStatus, "professional");

  const action = getSubmitAction(fromStatus);
  const now = new Date();
  const historyEntry = buildReviewHistoryEntry({
    action,
    fromStatus,
    toStatus,
    actorUserId: ownerUserId,
    actorRole: "professional",
  });

  const result = await Project.updateOne(
    {
      _id: new Types.ObjectId(projectId),
      ownerUserId: new Types.ObjectId(ownerUserId),
      status: fromStatus,
    },
    {
      $set: {
        status: toStatus,
        submittedAt: now,
      },
      $push: {
        reviewHistory: historyEntry,
      },
    },
  );

  if (result.matchedCount === 0) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_SUBMITTABLE);
  }
}
