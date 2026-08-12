"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  approveProject,
  rejectProject,
  requestProjectChanges,
} from "@/lib/projects/project-admin-mutations";
import {
  PROJECT_ERRORS,
  parseApproveProjectInput,
  parseRejectProjectInput,
  parseRequestChangesInput,
} from "@/lib/projects/project-validation";
import type { AdminReviewActionState } from "@/types/project";

export async function approveProjectAction(
  projectId: string,
  note?: string,
): Promise<AdminReviewActionState> {
  const user = await requireAdmin();

  const parsed = parseApproveProjectInput({ projectId, note });
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await approveProject(user.id, parsed.data.projectId, parsed.data.note);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function requestProjectChangesAction(
  projectId: string,
  message: string,
): Promise<AdminReviewActionState> {
  const user = await requireAdmin();

  const parsed = parseRequestChangesInput({ projectId, message });
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await requestProjectChanges(
      user.id,
      parsed.data.projectId,
      parsed.data.message,
    );
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function rejectProjectAction(
  projectId: string,
  reason: string,
): Promise<AdminReviewActionState> {
  const user = await requireAdmin();

  const parsed = parseRejectProjectInput({ projectId, reason });
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors };
  }

  try {
    await rejectProject(user.id, parsed.data.projectId, parsed.data.reason);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}
