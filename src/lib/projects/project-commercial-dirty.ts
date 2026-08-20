import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import Project, { type IProject } from "@/models/Project";
import { usesLayeredPricing } from "@/lib/projects/project-workspace-gates";

export type CommercialDirtyProjectInput = Pick<
  IProject,
  "onboardingStatus" | "status" | "commercialDirty"
>;

export function isCommercialDirty(project: Pick<IProject, "commercialDirty">): boolean {
  return project.commercialDirty === true;
}

export function shouldMarkCommercialDirty(
  project: Pick<IProject, "onboardingStatus" | "status">,
): boolean {
  return usesLayeredPricing(project) && project.status === "approved";
}

export function commercialDirtyUpdateFields(
  project: CommercialDirtyProjectInput,
): { commercialDirty: true; commercialDirtyAt: Date } | null {
  if (!shouldMarkCommercialDirty(project) || isCommercialDirty(project)) {
    return null;
  }

  return {
    commercialDirty: true,
    commercialDirtyAt: new Date(),
  };
}

export function appendCommercialDirtyToSet(
  project: CommercialDirtyProjectInput,
  $set: Record<string, unknown>,
): void {
  const dirtyFields = commercialDirtyUpdateFields(project);

  if (dirtyFields) {
    Object.assign($set, dirtyFields);
  }
}

export function applyCommercialDirtyToDocument(project: IProject): void {
  const dirtyFields = commercialDirtyUpdateFields(project);

  if (dirtyFields) {
    project.commercialDirty = dirtyFields.commercialDirty;
    project.commercialDirtyAt = dirtyFields.commercialDirtyAt;
  }
}

export async function markProjectCommercialDirtyIfNeeded(
  projectId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(projectId)) {
    return;
  }

  await connectDB();

  const project = await Project.findById(projectId).select(
    "onboardingStatus status commercialDirty",
  );

  if (!project) {
    return;
  }

  const dirtyFields = commercialDirtyUpdateFields(project);

  if (!dirtyFields) {
    return;
  }

  await Project.updateOne({ _id: project._id }, { $set: dirtyFields });
}
