import { describe, expect, it } from "vitest";
import {
  mapProductInputToWriteFields,
  productInputSchema,
} from "@/lib/products/product-validation";

const validInput = {
  nameHe: "ספת Milano",
  nameEn: "Milano Sofa",
  slug: "milano-sofa",
  sku: "PS-MIL-001",
  categoryId: "507f1f77bcf86cd799439011",
  brand: "Paper & Stone",
  designer: "Studio Forma",
  shortDescription: "תיאור קצר",
  longDescription: "תיאור ארוך",
  isActive: true,
  isFeatured: true,
  width: "260",
  depth: "98",
  height: "78",
  seatHeight: "43",
  materials: ["עץ"],
  maintenance: "ניקוי",
  warranty: "5 שנים",
  countryOfOrigin: "איטליה",
  materialOptions: [
    {
      materialId: "507f1f77bcf86cd799439012",
      allowedColorIds: ["507f1f77bcf86cd799439013"],
    },
  ],
  sizes: [{ key: "220", label: '220 ס"מ' }],
};

describe("product validation", () => {
  it("accepts valid product input", () => {
    const parsed = productInputSchema.safeParse(validInput);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid slug format", () => {
    const parsed = productInputSchema.safeParse({
      ...validInput,
      slug: "Invalid Slug",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate material ids", () => {
    const parsed = productInputSchema.safeParse({
      ...validInput,
      materialOptions: [
        validInput.materialOptions[0],
        validInput.materialOptions[0],
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects non-positive dimensions", () => {
    const parsed = productInputSchema.safeParse({
      ...validInput,
      width: "0",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("mapProductInputToWriteFields", () => {
  it("maps only whitelisted fields", () => {
    const parsed = productInputSchema.parse(validInput);
    const fields = mapProductInputToWriteFields(parsed);

    expect(fields).toEqual({
      nameHe: "ספת Milano",
      nameEn: "Milano Sofa",
      slug: "milano-sofa",
      sku: "PS-MIL-001",
      categoryId: "507f1f77bcf86cd799439011",
      brand: "Paper & Stone",
      designer: "Studio Forma",
      shortDescription: "תיאור קצר",
      longDescription: "תיאור ארוך",
      isActive: true,
      isFeatured: true,
      width: 260,
      depth: 98,
      height: 78,
      seatHeight: 43,
      materials: ["עץ"],
      maintenance: "ניקוי",
      warranty: "5 שנים",
      countryOfOrigin: "איטליה",
      materialOptions: validInput.materialOptions,
      sizes: validInput.sizes,
    });

    expect(fields).not.toHaveProperty("_id");
    expect(fields).not.toHaveProperty("createdAt");
    expect(fields).not.toHaveProperty("fabrics");
  });
});
