"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  createProjectPaymentAsAdmin,
  deleteProjectPaymentAsAdmin,
  updateProjectPaymentAsAdmin,
} from "@/lib/projects/project-payment-mutations";
import {
  parseProjectPaymentInput,
  parseProjectPaymentUpdateInput,
} from "@/lib/projects/project-payment-validation";
import {
  PROJECT_PAYMENT_ERRORS,
  type ProjectPaymentInput,
  type ProjectPaymentUpdateInput,
} from "@/types/project-payment";
import type { ProjectFormState } from "@/types/project";

export async function createProjectPaymentAction(
  input: ProjectPaymentInput,
): Promise<ProjectFormState> {
  const user = await requireAdmin();

  const parsed = parseProjectPaymentInput(input);
  if (!parsed.success) {
    return { error: Object.values(parsed.fieldErrors)[0] };
  }

  try {
    await createProjectPaymentAsAdmin(user.id, parsed.data);
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_PAYMENT_ERRORS.PROJECT_NOT_FOUND };
  }
}

export async function updateProjectPaymentAction(
  input: ProjectPaymentUpdateInput,
): Promise<ProjectFormState> {
  const user = await requireAdmin();

  const parsed = parseProjectPaymentUpdateInput(input);
  if (!parsed.success) {
    return { error: Object.values(parsed.fieldErrors)[0] };
  }

  try {
    await updateProjectPaymentAsAdmin(user.id, parsed.data);
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_PAYMENT_ERRORS.NOT_FOUND };
  }
}

export async function deleteProjectPaymentAction(
  projectId: string,
  paymentId: string,
): Promise<ProjectFormState> {
  await requireAdmin();

  try {
    await deleteProjectPaymentAsAdmin(projectId, paymentId);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_PAYMENT_ERRORS.NOT_FOUND };
  }
}
