import type { PublicCategoryNavDepartmentView } from "@/types/public-category-nav";

export function departmentHasMegaMenuContent(
  department: PublicCategoryNavDepartmentView,
): boolean {
  return department.groups.length > 0 || department.directLeaves.length > 0;
}
