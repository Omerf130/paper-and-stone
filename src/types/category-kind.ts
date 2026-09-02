export const CATEGORY_KINDS = ["department", "group", "leaf"] as const;

export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export function isProductAssignableCategoryKind(kind: CategoryKind): boolean {
  return kind === "leaf";
}
