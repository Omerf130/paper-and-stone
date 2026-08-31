"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { updateProjectItemLogisticsAsAdmin } from "@/lib/projects/project-item-logistics-mutations";
import { parseProjectItemLogisticsUpdateInput } from "@/lib/projects/project-item-logistics-validation";
import { PROJECT_ITEM_LOGISTICS_ERRORS } from "@/types/project-item-logistics";
import type { UpdateProjectItemLogisticsInput } from "@/types/project-item-logistics";
import type { ProjectFormState } from "@/types/project";

export async function updateProjectItemLogisticsAction(
  input: UpdateProjectItemLogisticsInput,
): Promise<ProjectFormState> {
  const user = await requireAdmin();

  const parsed = parseProjectItemLogisticsUpdateInput(input);
  if (!parsed.success) {
    return { error: parsed.error };
  }

  try {
    await updateProjectItemLogisticsAsAdmin(user.id, parsed.data);
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: PROJECT_ITEM_LOGISTICS_ERRORS.PROJECT_NOT_FOUND };
  }
}
