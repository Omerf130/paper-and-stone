import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  getDefaultHomepageContentSnapshot,
} from "@/lib/cms/cms-defaults";
import {
  homepageCategoryItemSchema,
  parseHomepageHeroFormInput,
} from "@/lib/cms/cms-validation";
import { HOMEPAGE_DEFAULT_CATEGORY_ITEM_IDS } from "@/lib/cms/cms-default-item-ids";

describe("cms-default stable item IDs", () => {
  it("resolves DEFAULT_HOMEPAGE_CONTENT multiple times with identical IDs", () => {
    const first = structuredClone(DEFAULT_HOMEPAGE_CONTENT);
    const second = structuredClone(DEFAULT_HOMEPAGE_CONTENT);

    expect(first.categories.items.map((item) => item.id)).toEqual(
      second.categories.items.map((item) => item.id),
    );
    expect(first.inspiration.items.map((item) => item.id)).toEqual(
      second.inspiration.items.map((item) => item.id),
    );
    expect(first.professionals.steps.map((step) => step.id)).toEqual(
      second.professionals.steps.map((step) => step.id),
    );
  });

  it("uses fixed literal UUIDs for default category tiles", () => {
    expect(DEFAULT_HOMEPAGE_CONTENT.categories.items[0]?.id).toBe(
      HOMEPAGE_DEFAULT_CATEGORY_ITEM_IDS.sofas,
    );
  });

  it("accepts default item IDs in server validation schema", () => {
    for (const item of DEFAULT_HOMEPAGE_CONTENT.categories.items) {
      expect(homepageCategoryItemSchema.safeParse(item).success).toBe(true);
    }
  });

  it("accepts newly generated admin UUIDs in validation schema", () => {
    const parsed = homepageCategoryItemSchema.safeParse({
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      layout: "medium",
      isVisible: true,
      order: 0,
    });

    expect(parsed.success).toBe(true);
  });

  it("loads defaults via snapshot helper without regenerating IDs", () => {
    const snapshot = getDefaultHomepageContentSnapshot();
    expect(snapshot.categories.items[0]?.id).toBe(
      DEFAULT_HOMEPAGE_CONTENT.categories.items[0]?.id,
    );
  });
});

describe("homepage hero form parser", () => {
  it("requires hero to remain visible", () => {
    const parsed = parseHomepageHeroFormInput({
      ...DEFAULT_HOMEPAGE_CONTENT.hero,
      isVisible: false,
    });

    expect(parsed.success).toBe(false);
  });
});
