"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/authorization";
import { deliverAdminPricingRound } from "@/lib/pricing/deliver-admin-pricing-round";
import { ProjectMutationError } from "@/lib/projects/project-errors";

const deliverAdminPricingRoundSchema = z.object({
  projectId: z.string().regex(/^[a-f0-9]{24}$/i, "מזהה פרויקט לא תקין"),
  expectedAdminPricingRevision: z.coerce.number().int().min(0),
});

export type AdminPricingDeliveryActionState = {
  error?: string;
  success?: boolean;
};

export async function deliverAdminPricingRoundAction(
  input: z.input<typeof deliverAdminPricingRoundSchema>,
): Promise<AdminPricingDeliveryActionState> {
  const admin = await requireAdmin();
  const parsed = deliverAdminPricingRoundSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "קלט לא תקין",
    };
  }

  try {
    await deliverAdminPricingRound(admin.id, parsed.data);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${parsed.data.projectId}`);
    revalidatePath("/professional/projects");
    revalidatePath(`/professional/projects/${parsed.data.projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בשליחת התמחור. נסו שוב." };
  }
}
