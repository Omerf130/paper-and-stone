import { describe, expect, it } from "vitest";
import { departmentHasMegaMenuContent } from "@/lib/categories/department-has-mega-menu-content";
import type { PublicCategoryNavDepartmentView } from "@/types/public-category-nav";

function department(
  partial: Partial<PublicCategoryNavDepartmentView>,
): PublicCategoryNavDepartmentView {
  return {
    slug: "living",
    nameHe: "מגורים",
    isNavigable: false,
    groups: [],
    directLeaves: [],
    ...partial,
  };
}

describe("departmentHasMegaMenuContent", () => {
  it("returns true when department has grouped children", () => {
    expect(
      departmentHasMegaMenuContent(
        department({
          groups: [
            {
              slug: "seating",
              nameHe: "ישיבה",
              isNavigable: false,
              leaves: [
                {
                  slug: "sofas",
                  nameHe: "ספות",
                  productCount: 0,
                  isNavigable: false,
                },
              ],
            },
          ],
        }),
      ),
    ).toBe(true);
  });

  it("returns true when department has direct leaves", () => {
    expect(
      departmentHasMegaMenuContent(
        department({
          directLeaves: [
            {
              slug: "sample",
              nameHe: "דוגמה",
              productCount: 0,
              isNavigable: false,
            },
          ],
        }),
      ),
    ).toBe(true);
  });

  it("returns false for department shells without menu content", () => {
    expect(departmentHasMegaMenuContent(department({ slug: "dining" }))).toBe(false);
  });
});
