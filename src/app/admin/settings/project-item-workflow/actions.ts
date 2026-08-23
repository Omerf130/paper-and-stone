"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/authorization";
import { updateProjectItemWorkflowSettings } from "@/lib/project-items/update-project-item-workflow-settings";
import { projectItemWorkflowSettingsInputSchema } from "@/lib/project-items/project-item-workflow-validation";
import { ProjectMutationError } from "@/lib/projects/project-errors";

export type ProjectItemWorkflowSettingsActionState = {
  error?: string;
  success?: boolean;
};

export async function updateProjectItemWorkflowSettingsAction(
  input: z.input<typeof projectItemWorkflowSettingsInputSchema>,
): Promise<ProjectItemWorkflowSettingsActionState> {
  const admin = await requireAdmin();
  const parsed = projectItemWorkflowSettingsInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "קלט לא תקין",
    };
  }

  try {
    await updateProjectItemWorkflowSettings(admin.id, parsed.data);
    revalidatePath("/admin/settings/project-item-workflow");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בשמירת ההגדרות. נסו שוב." };
  }
}
