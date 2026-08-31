"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import { setProjectItemAdminPricing } from "@/lib/pricing/project-pricing-admin-mutations";
import {
  parseArchitectMarginShareInput,
  parseInternalCostInput,
  PRICING_ERRORS,
} from "@/lib/pricing/pricing-validation";
import type { ProjectFormState } from "@/types/project";

export async function setProjectItemAdminPricingAction(input: {
  projectId: string;
  itemId: string;
  internalCostShekels: string;
  clientPriceShekels: string;
  architectMarkupPercent: string;
  expectedPriceVersion?: number;
}): Promise<ProjectFormState> {
  const user = await requireAdmin();

  const internalCostAgorot = parseInternalCostInput(input.internalCostShekels);
  const clientPriceAgorot = parseInternalCostInput(input.clientPriceShekels);
  const architectMarkupBp = parseArchitectMarginShareInput(
    input.architectMarkupPercent,
  );

  const fieldErrors: Record<string, string> = {};

  if (internalCostAgorot == null) {
    fieldErrors.internalCostShekels = PRICING_ERRORS.INVALID_COST;
  }

  if (clientPriceAgorot == null) {
    fieldErrors.clientPriceShekels = PRICING_ERRORS.INVALID_COST;
  }

  if (architectMarkupBp == null) {
    fieldErrors.architectMarkupPercent = PRICING_ERRORS.INVALID_ARCHITECT_MARGIN_SHARE;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    await setProjectItemAdminPricing(user.id, {
      projectId: input.projectId,
      itemId: input.itemId,
      internalCostAgorot: internalCostAgorot!,
      clientPriceAgorot: clientPriceAgorot!,
      architectMarkupBp: architectMarkupBp!,
      expectedPriceVersion: input.expectedPriceVersion,
    });

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${input.projectId}`);
    revalidatePath("/professional");
    revalidatePath(`/professional/projects/${input.projectId}`);

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    console.error("setProjectItemAdminPricingAction failed:", error);
    return { error: "אירעה שגיאה בעדכון התמחור." };
  }
}

/** @deprecated Pricing V2 — project default markup removed */
export async function setProjectDefaultAdminMarkupAction(
  _projectId: string,
  _defaultAdminMarkupPercent: string,
): Promise<ProjectFormState> {
  return { error: PRICING_ERRORS.NOT_EDITABLE };
}
