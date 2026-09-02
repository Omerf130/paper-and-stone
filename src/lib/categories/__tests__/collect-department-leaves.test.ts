import { describe, expect, it } from "vitest";
import {
  collectDepartmentLeaves,
  departmentHasLandingContent,
  findDepartmentContext,
} from "@/lib/categories/collect-department-leaves";
import type { PublicCategoryNavDepartmentView } from "@/types/public-category-nav";

function leaf(slug: string, productCount: number, isNavigable = productCount > 0) {
  return {
    slug,
    nameHe: slug,
    productCount,
    isNavigable,
    href: isNavigable ? `/products?category=${slug}` : undefined,
  };
}

function department(
  slug: string,
  groups: PublicCategoryNavDepartmentView["groups"] = [],
  directLeaves: PublicCategoryNavDepartmentView["directLeaves"] = [],
): PublicCategoryNavDepartmentView {
  return {
    slug,
    nameHe: slug,
    isNavigable: false,
    groups,
    directLeaves,
  };
}

describe("collectDepartmentLeaves", () => {
  it("flattens grouped and direct leaves without group headings", () => {
    const living = department("living", [
      {
        slug: "seating",
        nameHe: "Seating",
        isNavigable: false,
        leaves: [leaf("sofas", 1), leaf("sectionals", 0)],
      },
      {
        slug: "tables",
        nameHe: "Tables",
        isNavigable: false,
        leaves: [leaf("coffee-tables", 0)],
      },
    ]);

    expect(collectDepartmentLeaves(living).map((item) => item.slug)).toEqual([
      "sofas",
      "sectionals",
      "coffee-tables",
    ]);
  });

  it("detects landing content and department context for leaf slugs", () => {
    const living = department("living", [
      {
        slug: "seating",
        nameHe: "Seating",
        isNavigable: true,
        leaves: [leaf("sofas", 1)],
      },
    ]);

    expect(departmentHasLandingContent(living)).toBe(true);
    expect(findDepartmentContext([living], "sofas")?.department.slug).toBe("living");
    expect(findDepartmentContext([living], "living")?.department.slug).toBe("living");
  });
});
