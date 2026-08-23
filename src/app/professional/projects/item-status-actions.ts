"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProfessional } from "@/lib/auth/authorization";
import { setProjectItemStatusAsArchitect } from "@/lib/project-items/set-project-item-status";
import { PROJECT_ITEM_STATUSES } from "@/types/project-item-status";
import { ProjectMutationError } from "@/lib/projects/project-errors";

const setProjectItemStatusSchema = z.object({
  projectId: z.string().regex(/^[a-f0-9]{24}$/i, "מזהה פרויקט לא תקין"),
  projectItemId: z.string().regex(/^[a-f0-9]{24}$/i, "מזהה מוצר לא תקין"),
  targetStatus: z.enum(PROJECT_ITEM_STATUSES),
});

export type ProfessionalProjectItemStatusActionState = {
  error?: string;
  success?: boolean;
};

export async function setArchitectProjectItemStatusAction(
  input: z.input<typeof setProjectItemStatusSchema>,
): Promise<ProfessionalProjectItemStatusActionState> {
  const user = await requireProfessional();
  const parsed = setProjectItemStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "קלט לא תקין",
    };
  }

  try {
    await setProjectItemStatusAsArchitect(user.id, parsed.data);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    revalidatePath("/professional/projects");
    revalidatePath(`/professional/projects/${parsed.data.projectId}`);
    revalidatePath("/client/projects");
    revalidatePath(`/client/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בעדכון סטטוס המוצר. נסו שוב." };
  }
}
