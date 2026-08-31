import type { IProjectItem } from "@/models/Project";
import { isItemCommercialPricingComplete } from "@/lib/pricing/pricing-commercial-model";

export type ProjectItemCommercialConfiguration = Pick<
  IProjectItem,
  "selectedMaterialId" | "selectedColorId" | "selectedSizeKey"
>;

export function hasCommercialConfigurationChanged(
  before: ProjectItemCommercialConfiguration,
  after: ProjectItemCommercialConfiguration,
): boolean {
  return (
    before.selectedMaterialId !== after.selectedMaterialId ||
    before.selectedColorId !== after.selectedColorId ||
    before.selectedSizeKey !== after.selectedSizeKey
  );
}

export function shouldMarkItemPricingNeedsReview(input: {
  existingItem: Pick<IProjectItem, "pricing"> & ProjectItemCommercialConfiguration;
  nextConfiguration: ProjectItemCommercialConfiguration;
}): boolean {
  if (!isItemCommercialPricingComplete(input.existingItem.pricing)) {
    return false;
  }

  return hasCommercialConfigurationChanged(
    input.existingItem,
    input.nextConfiguration,
  );
}
