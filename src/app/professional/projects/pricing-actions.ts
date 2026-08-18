"use server";

import { revalidatePath } from "next/cache";
import { requireProfessional } from "@/lib/auth/authorization";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  setProjectDefaultArchitectMarkup,
  setProjectItemArchitectPricing,
} from "@/lib/pricing/project-pricing-architect-mutations";
import {
  parseMarkupPercentageInput,
  PRICING_ERRORS,
} from "@/lib/pricing/pricing-validation";
import type { ProjectFormState } from "@/types/project";

export async function setProjectItemArchitectPricingAction(input: {
  projectId: string;
  itemId: string;
  useProjectDefaultArchitectMarkup?: boolean;
  itemArchitectMarkupPercent?: string;
  clearArchitectMarkupOverride?: boolean;
  expectedPriceVersion?: number;
}): Promise<ProjectFormState> {
  const user = await requireProfessional();

  let itemArchitectMarkupBp: number | undefined;
  if (input.itemArchitectMarkupPercent?.trim()) {
    const parsedMarkup = parseMarkupPercentageInput(input.itemArchitectMarkupPercent);
    if (parsedMarkup == null) {
      return {
        fieldErrors: { itemArchitectMarkupPercent: PRICING_ERRORS.INVALID_MARKUP },
      };
    }
    itemArchitectMarkupBp = parsedMarkup;
  }

  try {
    await setProjectItemArchitectPricing(user.id, {
      projectId: input.projectId,
      itemId: input.itemId,
      useProjectDefaultArchitectMarkup: input.useProjectDefaultArchitectMarkup,
      itemArchitectMarkupBp,
      clearArchitectMarkupOverride: input.clearArchitectMarkupOverride,
      expectedPriceVersion: input.expectedPriceVersion,
    });

    revalidatePath("/professional");
    revalidatePath(`/professional/projects/${input.projectId}`);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${input.projectId}`);

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    return { error: "אירעה שגיאה בעדכון מחיר הלקוח." };
  }
}

export async function setProjectDefaultArchitectMarkupAction(
  projectId: string,
  defaultArchitectMarkupPercent: string,
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  const defaultArchitectMarkupBp = parseMarkupPercentageInput(
    defaultArchitectMarkupPercent,
  );
  if (defaultArchitectMarkupBp == null) {
    return {
      fieldErrors: { defaultArchitectMarkupPercent: PRICING_ERRORS.INVALID_MARKUP },
    };
  }

  try {
    await setProjectDefaultArchitectMarkup(user.id, {
      projectId,
      defaultArchitectMarkupBp,
    });

    revalidatePath("/professional");
    revalidatePath(`/professional/projects/${projectId}`);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message, fieldErrors: error.fieldErrors };
    }

    return { error: "אירעה שגיאה בעדכון ברירת המחדל לתמחור ללקוח." };
  }
}
