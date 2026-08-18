import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import {
  isProjectItemEditable,
  isProjectOnboardingActive,
  usesRoomBasedWorkspace,
} from "@/lib/projects/project-workspace-gates";

export async function verifyProjectPickerAccess(
  ownerUserId: string,
  projectId: string,
): Promise<void> {
  await connectDB();

  if (!Types.ObjectId.isValid(projectId)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  const project = await Project.findOne({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(ownerUserId),
  }).select("_id status onboardingStatus");

  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (!usesRoomBasedWorkspace(project)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_EDITABLE);
  }

  if (!isProjectOnboardingActive(project)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_EDITABLE);
  }

  if (!isProjectItemEditable(project)) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_EDITABLE);
  }
}
