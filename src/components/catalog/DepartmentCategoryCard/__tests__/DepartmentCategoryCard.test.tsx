import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DepartmentCategoryCard from "@/components/catalog/DepartmentCategoryCard/DepartmentCategoryCard";

describe("DepartmentCategoryCard", () => {
  it("renders a quiet empty image area without product imagery", () => {
    const html = renderToStaticMarkup(
      <DepartmentCategoryCard
        leaf={{
          slug: "sectionals",
          nameHe: "ספות מודולריות",
          productCount: 0,
          isNavigable: false,
        }}
      />,
    );

    expect(html).toContain('class="');
    expect(html).toContain("0 פריטים");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("CatalogProductImage");
  });

  it("links populated categories to the filtered catalog", () => {
    const html = renderToStaticMarkup(
      <DepartmentCategoryCard
        leaf={{
          slug: "sofas",
          nameHe: "ספות",
          productCount: 1,
          isNavigable: true,
          href: "/products?category=sofas",
        }}
      />,
    );

    expect(html).toContain('href="/products?category=sofas"');
    expect(html).toContain("פריט אחד");
  });
});
