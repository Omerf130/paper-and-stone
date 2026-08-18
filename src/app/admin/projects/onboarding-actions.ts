"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { searchClientsForAdmin } from "@/lib/admin/clients/client-lookup-queries";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  approveProjectOnboarding,
  reassignProjectClient,
  rejectProjectOnboarding,
} from "@/lib/projects/project-onboarding-mutations";
import { PROJECT_ERRORS } from "@/lib/projects/project-validation";
import type { AdminReviewActionState } from "@/types/project";
import type { ClientLookupItem } from "@/lib/admin/clients/client-lookup-queries";

export async function searchClientsForAdminAction(
  query: string,
): Promise<{ clients: ClientLookupItem[]; error?: string }> {
  await requireAdmin();

  try {
    const clients = await searchClientsForAdmin(query);
    return { clients };
  } catch {
    return { clients: [], error: PROJECT_ERRORS.GENERIC };
  }
}

export async function approveProjectOnboardingAction(
  projectId: string,
  clientUserId: string,
): Promise<AdminReviewActionState> {
  const admin = await requireAdmin();

  try {
    await approveProjectOnboarding(admin.id, projectId, clientUserId);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath("/admin");
    revalidatePath("/professional/projects");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function rejectProjectOnboardingAction(
  projectId: string,
  reason?: string,
): Promise<AdminReviewActionState> {
  const admin = await requireAdmin();

  try {
    await rejectProjectOnboarding(admin.id, projectId, reason);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath("/admin");
    revalidatePath("/professional/projects");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}

export async function reassignProjectClientAction(
  projectId: string,
  clientUserId: string,
): Promise<AdminReviewActionState> {
  const admin = await requireAdmin();

  try {
    await reassignProjectClient(admin.id, projectId, clientUserId);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ERRORS.GENERIC };
  }
}
