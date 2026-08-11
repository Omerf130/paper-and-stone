import { describe, expect, it } from "vitest";
import {
  CATEGORY_ERRORS,
  categoryInputSchema,
  mapCategoryInputToWriteFields,
} from "@/lib/categories/category-validation";

const validInput = {
  nameHe: "ספות",
  nameEn: "Sofas",
  slug: "sofas",
  sortOrder: 0,
  isActive: true,
};

describe("category validation", () => {
  it("accepts valid category input", () => {
    const parsed = categoryInputSchema.safeParse(validInput);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid slug format", () => {
    const parsed = categoryInputSchema.safeParse({
      ...validInput,
      slug: "Invalid Slug",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects negative sortOrder", () => {
    const parsed = categoryInputSchema.safeParse({
      ...validInput,
      sortOrder: -1,
    });
    expect(parsed.success).toBe(false);
  });

  it("maps only whitelisted fields", () => {
    const parsed = categoryInputSchema.parse(validInput);
    const fields = mapCategoryInputToWriteFields(parsed);

    expect(fields).toEqual({
      nameHe: "ספות",
      nameEn: "Sofas",
      slug: "sofas",
      sortOrder: 0,
      isActive: true,
    });

    expect(fields).not.toHaveProperty("_id");
    expect(fields).not.toHaveProperty("createdAt");
  });

  it("maps empty nameEn to undefined", () => {
    const parsed = categoryInputSchema.parse({
      ...validInput,
      nameEn: "",
    });
    const fields = mapCategoryInputToWriteFields(parsed);

    expect(fields.nameEn).toBeUndefined();
  });
});

describe("CATEGORY_ERRORS", () => {
  it("includes duplicate slug message", () => {
    expect(CATEGORY_ERRORS.DUPLICATE_SLUG).toBe(
      "כבר קיימת קטגוריה עם כתובת זו",
    );
  });
});
