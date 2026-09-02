import type {
  PublicCategoryNavDepartmentView,
  PublicCategoryNavLeafView,
} from "@/types/public-category-nav";

export function collectDepartmentLeaves(
  department: PublicCategoryNavDepartmentView,
): PublicCategoryNavLeafView[] {
  return [
    ...department.directLeaves,
    ...department.groups.flatMap((group) => group.leaves),
  ];
}

export function departmentHasLandingContent(
  department: PublicCategoryNavDepartmentView,
): boolean {
  return collectDepartmentLeaves(department).length > 0;
}

export function findDepartmentContext(
  departments: PublicCategoryNavDepartmentView[],
  categorySlug: string | null | undefined,
): {
  department: PublicCategoryNavDepartmentView;
  leaves: PublicCategoryNavLeafView[];
} | null {
  const slug = categorySlug?.trim();

  if (!slug) {
    return null;
  }

  const asDepartment = departments.find((department) => department.slug === slug);

  if (asDepartment) {
    return {
      department: asDepartment,
      leaves: collectDepartmentLeaves(asDepartment),
    };
  }

  for (const department of departments) {
    const leaves = collectDepartmentLeaves(department);

    if (leaves.some((leaf) => leaf.slug === slug)) {
      return { department, leaves };
    }
  }

  return null;
}
