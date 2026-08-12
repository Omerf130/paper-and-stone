import type { IProject } from "@/models/Project";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";

export function assertProjectEditable(project: IProject | null): IProject {
  if (!project) {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_FOUND);
  }

  if (project.status !== "draft") {
    throw new ProjectMutationError(PROJECT_ERRORS.NOT_EDITABLE);
  }

  return project;
}
