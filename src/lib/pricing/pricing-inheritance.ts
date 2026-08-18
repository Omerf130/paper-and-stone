import type { IProject, IProjectItem, IProjectItemPricing } from "@/models/Project";

export function hasAdminMarkupOverride(
  pricing?: IProjectItemPricing | null,
): boolean {
  return pricing?.adminMarkupBp != null;
}

export function hasArchitectMarkupOverride(
  pricing?: IProjectItemPricing | null,
): boolean {
  return pricing?.architectMarkupBp != null;
}

export function getEffectiveAdminMarkupBp(
  item: Pick<IProjectItem, "pricing">,
  project: Pick<IProject, "defaultAdminMarkupBp">,
): number | null {
  if (item.pricing?.adminMarkupBp != null) {
    return item.pricing.adminMarkupBp;
  }

  return project.defaultAdminMarkupBp ?? null;
}

export function getEffectiveArchitectMarkupBp(
  item: Pick<IProjectItem, "pricing">,
  project: Pick<IProject, "defaultArchitectMarkupBp">,
): number | null {
  if (item.pricing?.architectMarkupBp != null) {
    return item.pricing.architectMarkupBp;
  }

  return project.defaultArchitectMarkupBp ?? null;
}
