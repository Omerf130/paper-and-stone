import { ProjectMutationError } from "@/lib/projects/project-errors";
import { PRICING_ERRORS } from "@/lib/pricing/pricing-validation";

/** @deprecated Pricing V2 — architect cannot edit commercial pricing */
export async function setProjectItemArchitectPricing(
  _ownerUserId: string,
  _input: {
    projectId: string;
    itemId: string;
    useProjectDefaultArchitectMarkup?: boolean;
    itemArchitectMarkupBp?: number;
    clearArchitectMarkupOverride?: boolean;
    expectedPriceVersion?: number;
  },
): Promise<void> {
  throw new ProjectMutationError(PRICING_ERRORS.ARCHITECT_PRICING_READONLY);
}

/** @deprecated Pricing V2 — architect cannot edit commercial pricing */
export async function setProjectDefaultArchitectMarkup(
  _ownerUserId: string,
  _input: { projectId: string; defaultArchitectMarkupBp: number },
): Promise<void> {
  throw new ProjectMutationError(PRICING_ERRORS.ARCHITECT_PRICING_READONLY);
}
