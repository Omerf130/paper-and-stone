import { describe, expect, it } from "vitest";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/cms/cms-defaults";
import type { HomepageCategoryRecord } from "@/lib/cms/get-homepage-category-records";
import { resolvePublicHomepageCategoryTiles } from "@/lib/cms/resolve-public-homepage-category-tiles";

describe("resolve-public-homepage-category-tiles", () => {
  const baseItem = DEFAULT_HOMEPAGE_CONTENT.categories.items[0]!;

  it("links active categories and prefers display title", () => {
    const records = new Map<string, HomepageCategoryRecord>([
      [
        "cat-1",
        {
          id: "cat-1",
          nameHe: "ספות",
          slug: "sofas",
          isActive: true,
        },
      ],
    ]);

    const tiles = resolvePublicHomepageCategoryTiles(
      [
        {
          ...baseItem,
          categoryId: "cat-1",
          displayTitle: "כותרת מותאמת",
        },
      ],
      records,
    );

    expect(tiles[0]).toMatchObject({
      title: "כותרת מותאמת",
      href: "/products?category=sofas",
    });
  });

  it("falls back to category name and omits href for inactive categories", () => {
    const records = new Map<string, HomepageCategoryRecord>([
      [
        "cat-2",
        {
          id: "cat-2",
          nameHe: "שולחנות",
          slug: "tables",
          isActive: false,
        },
      ],
    ]);

    const tiles = resolvePublicHomepageCategoryTiles(
      [
        {
          ...baseItem,
          categoryId: "cat-2",
          displayTitle: undefined,
        },
      ],
      records,
    );

    expect(tiles[0]).toMatchObject({
      title: "שולחנות",
      href: undefined,
    });
  });

  it("renders unlinked default tiles without href", () => {
    const tiles = resolvePublicHomepageCategoryTiles(
      [
        {
          ...baseItem,
          categoryId: undefined,
          displayTitle: "ריהוט",
        },
      ],
      new Map(),
    );

    expect(tiles[0]).toMatchObject({
      title: "ריהוט",
      href: undefined,
    });
  });

  it("hides invisible tiles and preserves order", () => {
    const tiles = resolvePublicHomepageCategoryTiles(
      [
        { ...baseItem, id: "a", order: 1, isVisible: false, displayTitle: "Hidden" },
        { ...baseItem, id: "b", order: 0, isVisible: true, displayTitle: "Visible" },
      ],
      new Map(),
    );

    expect(tiles.map((tile) => tile.id)).toEqual(["b"]);
  });
});
