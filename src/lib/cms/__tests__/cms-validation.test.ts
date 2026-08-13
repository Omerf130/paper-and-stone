import { describe, expect, it } from "vitest";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/cms/cms-defaults";
import {
  cmsCtaSchema,
  cmsImageSchema,
  homepageContentHasFeaturedProductIds,
  homepageContentInputSchema,
  validateHomepageSectionOrder,
} from "@/lib/cms/cms-validation";
import { DEFAULT_HOMEPAGE_SECTION_ORDER } from "@/types/cms-content";

describe("cms-validation", () => {
  it("validates a complete homepage section order", () => {
    const result = validateHomepageSectionOrder(DEFAULT_HOMEPAGE_SECTION_ORDER);
    expect(result.success).toBe(true);
  });

  it("requires hero to remain first", () => {
    const reordered = [...DEFAULT_HOMEPAGE_SECTION_ORDER];
    reordered[0] = "categories";
    reordered[1] = "hero";

    const result = validateHomepageSectionOrder(reordered);
    expect(result.success).toBe(false);
  });

  it("rejects duplicate section keys", () => {
    const duplicated = [...DEFAULT_HOMEPAGE_SECTION_ORDER];
    duplicated[2] = "hero";

    const result = validateHomepageSectionOrder(duplicated);
    expect(result.success).toBe(false);
  });

  it("rejects unknown section keys", () => {
    const invalid = [...DEFAULT_HOMEPAGE_SECTION_ORDER];
    invalid[3] = "unknown" as (typeof invalid)[number];

    const result = validateHomepageSectionOrder(invalid);
    expect(result.success).toBe(false);
  });

  it("requires alt text for non-decorative images", () => {
    const result = cmsImageSchema.safeParse({
      url: "https://example.com/image.jpg",
      storageKey: "cms/homepage/hero/image.jpg",
    });

    expect(result.success).toBe(false);
  });

  it("allows decorative images without alt text", () => {
    const result = cmsImageSchema.safeParse({
      url: "https://example.com/image.jpg",
      storageKey: "cms/homepage/hero/image.jpg",
      isDecorative: true,
    });

    expect(result.success).toBe(true);
  });

  it("validates category ObjectId references", () => {
    const parsed = homepageContentInputSchema.safeParse({
      ...DEFAULT_HOMEPAGE_CONTENT,
      categories: {
        ...DEFAULT_HOMEPAGE_CONTENT.categories,
        items: [
          {
            id: "a1000001-0001-4001-8001-000000000099",
            categoryId: "not-an-object-id",
            layout: "large",
            isVisible: true,
            order: 0,
          },
        ],
      },
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate category selections", () => {
    const categoryId = "507f1f77bcf86cd799439011";
    const parsed = homepageContentInputSchema.safeParse({
      ...DEFAULT_HOMEPAGE_CONTENT,
      categories: {
        ...DEFAULT_HOMEPAGE_CONTENT.categories,
        items: [
          {
            id: "a1000001-0001-4001-8001-000000000001",
            categoryId,
            layout: "large",
            isVisible: true,
            order: 0,
          },
          {
            id: "a1000001-0001-4001-8001-000000000002",
            categoryId,
            layout: "medium",
            isVisible: true,
            order: 1,
          },
        ],
      },
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects unsafe CTA hrefs", () => {
    const result = cmsCtaSchema.safeParse({
      label: "External",
      href: "https://example.com",
    });

    expect(result.success).toBe(false);
  });

  it("does not allow featured product ID lists in homepage content", () => {
    expect(
      homepageContentHasFeaturedProductIds({
        featuredProducts: {
          productIds: ["507f1f77bcf86cd799439011"],
        },
      }),
    ).toBe(true);

    expect(homepageContentHasFeaturedProductIds(DEFAULT_HOMEPAGE_CONTENT)).toBe(
      false,
    );
  });
});
