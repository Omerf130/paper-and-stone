"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  setProjectDefaultAdminMarkup,
  setProjectItemAdminPricing,
} from "@/lib/pricing/project-pricing-admin-mutations";
import {
  parseInternalCostInput,
  parseMarkupPercentageInput,
  PRICING_ERRORS,
} from "@/lib/pricing/pricing-validation";
import type { ProjectFormState } from "@/types/project";

export async function setProjectItemAdminPricingAction(input: {
  projectId: string;
  itemId: string;
  internalCostShekels: string;
  useProjectDefaultAdminMarkup?: boolean;
  itemAdminMarkupPercent?: string;
  clearAdminMarkupOverride?: boolean;
  expectedPriceVersion?: number;
}): Promise<ProjectFormState> {
  const user = await requireAdmin();

  const internalCostAgorot = parseInternalCostInput(input.internalCostShekels);
  if (internalCostAgorot == null) {
    return { fieldErrors: { internalCostShekels: PRICING_ERRORS.INVALID_COST } };
  }

  let itemAdminMarkupBp: number | undefined;
  if (input.itemAdminMarkupPercent?.trim()) {
    const parsedMarkup = parseMarkupPercentageInput(input.itemAdminMarkupPercent);
    if (parsedMarkup == null) {
      return { fieldErrors: { itemAdminMarkupPercent: PRICING_ERRORS.INVALID_MARKUP } };
    }
    itemAdminMarkupBp = parsedMarkup;
  }

  try {
    await setProjectItemAdminPricing(user.id, {
      projectId: input.projectId,
      itemId: input.itemId,
      internalCostAgorot,
      useProjectDefaultAdminMarkup: input.useProjectDefaultAdminMarkup,
      itemAdminMarkupBp,
      clearAdminMarkupOverride: input.clearAdminMarkupOverride,
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

export async function setProjectDefaultAdminMarkupAction(
  projectId: string,
  defaultAdminMarkupPercent: string,
): Promise<ProjectFormState> {
  const user = await requireAdmin();

  const defaultAdminMarkupBp = parseMarkupPercentageInput(defaultAdminMarkupPercent);
  if (defaultAdminMarkupBp == null) {
    return { fieldErrors: { defaultAdminMarkupPercent: PRICING_ERRORS.INVALID_MARKUP } };
  }

  try {
    await setProjectDefaultAdminMarkup(user.id, {
      projectId,
      defaultAdminMarkupBp,
    });

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath("/professional");
    revalidatePath(`/professional/projects/${projectId}`);

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    return { error: "אירעה שגיאה בעדכון ברירת המחדל לתמחור." };
  }
}
