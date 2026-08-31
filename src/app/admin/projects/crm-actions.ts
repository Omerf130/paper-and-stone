"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  createProjectAsAdmin,
  parseAdminCreateProjectInput,
} from "@/lib/projects/project-admin-create-mutations";
import {
  reassignProjectArchitect,
  reassignProjectClientAsAdmin,
} from "@/lib/projects/project-admin-assignment-mutations";
import { ProjectMutationError } from "@/lib/projects/project-errors";

export async function createProjectAsAdminAction(input: unknown) {
  const admin = await requireAdmin();

  const parsed = parseAdminCreateProjectInput(input);
  if (!parsed.success) {
    return { error: Object.values(parsed.fieldErrors)[0] };
  }

  try {
    const projectId = await createProjectAsAdmin(admin.id, parsed.data);
    revalidatePath("/admin/projects");
    redirect(`/admin/projects/${projectId}?tab=summary`);
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }
    return { error: "אירעה שגיאה ביצירת הפרויקט." };
  }
}

export async function reassignProjectArchitectAction(
  projectId: string,
  architectUserId: string,
) {
  const admin = await requireAdmin();

  try {
    await reassignProjectArchitect(admin.id, projectId, architectUserId);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }
    return { error: "אירעה שגיאה בעדכון האדריכל." };
  }
}

export async function reassignProjectClientFromCrmAction(
  projectId: string,
  clientUserId: string,
) {
  const admin = await requireAdmin();

  try {
    await reassignProjectClientAsAdmin(admin.id, projectId, clientUserId);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }
    return { error: "אירעה שגיאה בעדכון הלקוח." };
  }
}
