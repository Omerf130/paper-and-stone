import { describe, expect, it } from "vitest";
import { buildPublicCategoryNavPresentation } from "@/lib/catalog/build-public-category-nav-presentation";

describe("buildPublicCategoryNavPresentation", () => {
  it("maps categories to nav items with homepage tile images", () => {
    const items = buildPublicCategoryNavPresentation(
      [
        { slug: "sofas", nameHe: "ספות" },
        { slug: "tables", nameHe: "שולחנות" },
      ],
      [
        {
          id: "1",
          title: "ספות",
          layout: "large",
          href: "/products?category=sofas",
          image: {
            url: "https://example.com/sofa.jpg",
            alt: "ספות",
            width: 400,
            height: 500,
          },
        },
      ],
    );

    expect(items).toEqual([
      {
        slug: "sofas",
        nameHe: "ספות",
        href: "/products?category=sofas",
        image: {
          url: "https://example.com/sofa.jpg",
          alt: "ספות",
          width: 400,
          height: 500,
        },
      },
      {
        slug: "tables",
        nameHe: "שולחנות",
        href: "/products?category=tables",
        image: undefined,
      },
    ]);
  });
});
