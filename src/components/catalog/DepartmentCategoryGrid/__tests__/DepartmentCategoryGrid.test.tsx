import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DepartmentCategoryGrid from "@/components/catalog/DepartmentCategoryGrid/DepartmentCategoryGrid";
import type { PublicCategoryNavLeafView } from "@/types/public-category-nav";

function leaf(
  partial: Partial<PublicCategoryNavLeafView> & Pick<PublicCategoryNavLeafView, "slug" | "nameHe">,
): PublicCategoryNavLeafView {
  return {
    productCount: 0,
    isNavigable: false,
    ...partial,
  };
}

describe("DepartmentCategoryGrid", () => {
  it("renders category cards for every department leaf, including empty categories", () => {
    const html = renderToStaticMarkup(
      <DepartmentCategoryGrid
        leaves={[
          leaf({
            slug: "sofas",
            nameHe: "ספות",
            productCount: 1,
            isNavigable: true,
            href: "/products?category=sofas",
          }),
          leaf({
            slug: "sectionals",
            nameHe: "ספות מודולריות",
            productCount: 0,
            isNavigable: false,
          }),
        ]}
      />,
    );

    expect(html).toContain("ספות");
    expect(html).toContain("ספות מודולריות");
    expect(html).toContain("0 פריטים");
    expect(html).not.toContain("ProductCatalogGrid");
    expect(html).not.toContain("CatalogProductImage");
  });
});
