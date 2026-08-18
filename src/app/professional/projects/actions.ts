"use server";

import { revalidatePath } from "next/cache";
import { requireProfessional } from "@/lib/auth/authorization";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { resubmitProjectOnboarding } from "@/lib/projects/project-onboarding-mutations";
import {
  PROJECT_ERRORS,
  parseProjectCreateInput,
  parseProjectFormInput,
} from "@/lib/projects/project-validation";
import type {
  ProjectCreateFormInput,
  ProjectFormInput,
  ProjectFormState,
} from "@/types/project";
import {
  addProductToProject,
  createProject,
  deleteProject,
  removeProjectItem,
  updateProject,
  updateProjectItem,
} from "@/lib/projects/project-mutations";
import { submitProject } from "@/lib/projects/project-submission";
import {
  parseAddToProjectInput,
  parseUpdateProjectItemInput,
} from "@/lib/projects/project-validation";
import type { AddToProjectInput, UpdateProjectItemInput } from "@/types/project";
import { redirect } from "next/navigation";

export async function createProjectAction(
  input: ProjectCreateFormInput,
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  const parsed = parseProjectCreateInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    const projectId = await createProject(user.id, parsed.data);
    redirect(`/professional/projects/${projectId}`);
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function updateProjectAction(
  projectId: string,
  input: ProjectFormInput,
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  const parsed = parseProjectFormInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await updateProject(user.id, projectId, parsed.data);
    revalidatePath(`/professional/projects/${projectId}`);
    revalidatePath("/professional/projects");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function resubmitProjectOnboardingAction(
  projectId: string,
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  try {
    await resubmitProjectOnboarding(user.id, projectId);
    revalidatePath(`/professional/projects/${projectId}`);
    revalidatePath("/professional/projects");
    revalidatePath("/admin/projects");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function deleteProjectAction(projectId: string): Promise<ProjectFormState> {
  const user = await requireProfessional();

  try {
    await deleteProject(user.id, projectId);
    revalidatePath("/professional/projects");
    redirect("/professional/projects");
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function addProductToProjectAction(
  input: AddToProjectInput,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireProfessional();

  const parsed = parseAddToProjectInput(input);
  if (!parsed.success) {
    return { error: Object.values(parsed.fieldErrors)[0] };
  }

  try {
    await addProductToProject(
      user.id,
      parsed.data.projectId,
      parsed.data.productSlug,
      parsed.data.quantity,
      parsed.data.selectedMaterialId,
      parsed.data.selectedColorId,
      parsed.data.selectedSizeKey,
    );
    revalidatePath(`/professional/projects/${parsed.data.projectId}`);
    revalidatePath("/professional/projects");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function updateProjectItemAction(
  input: UpdateProjectItemInput,
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  const parsed = parseUpdateProjectItemInput(input);
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await updateProjectItem(
      user.id,
      parsed.data.projectId,
      parsed.data.itemId,
      parsed.data.quantity,
      parsed.data.selectedMaterialId,
      parsed.data.selectedColorId,
      parsed.data.selectedSizeKey,
    );
    revalidatePath(`/professional/projects/${parsed.data.projectId}`);
    revalidatePath("/professional/projects");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return {
        error: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function removeProjectItemAction(
  projectId: string,
  itemId: string,
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  try {
    await removeProjectItem(user.id, projectId, itemId);
    revalidatePath(`/professional/projects/${projectId}`);
    revalidatePath("/professional/projects");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function submitProjectAction(
  projectId: string,
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  try {
    await submitProject(user.id, projectId);
    revalidatePath(`/professional/projects/${projectId}`);
    revalidatePath("/professional/projects");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}
