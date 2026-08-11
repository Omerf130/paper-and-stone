import { describe, expect, it, vi, beforeEach } from "vitest";

const materialFindMock = vi.fn();
const colorFindMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Material", () => ({
  default: {
    find: (...args: unknown[]) => ({
      select: () => ({
        lean: () => materialFindMock(...args),
      }),
    }),
  },
}));

vi.mock("@/models/Color", () => ({
  default: {
    find: (...args: unknown[]) => ({
      select: () => ({
        lean: () => colorFindMock(...args),
      }),
    }),
  },
}));

describe("verifyProductMaterialOptions", () => {
  beforeEach(() => {
    materialFindMock.mockReset();
    colorFindMock.mockReset();
  });

  it("requires active materials on create", async () => {
    const materialId = "507f1f77bcf86cd799439011";
    const colorId = "507f1f77bcf86cd799439012";

    materialFindMock.mockResolvedValue([
      { _id: materialId, isActive: false, colorIds: [colorId] },
    ]);
    colorFindMock.mockResolvedValue([{ _id: colorId, isActive: true }]);

    const { verifyProductMaterialOptions } = await import(
      "@/lib/products/material-options/verifyProductMaterialOptions"
    );

    const result = await verifyProductMaterialOptions([
      { materialId, allowedColorIds: [colorId] },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("לא ניתן להוסיף חומר לא פעיל");
    }
  });

  it("allows previously assigned inactive materials on update", async () => {
    const materialId = "507f1f77bcf86cd799439011";
    const colorId = "507f1f77bcf86cd799439012";

    materialFindMock.mockResolvedValue([
      { _id: materialId, isActive: false, colorIds: [colorId] },
    ]);
    colorFindMock.mockResolvedValue([{ _id: colorId, isActive: true }]);

    const { verifyProductMaterialOptions } = await import(
      "@/lib/products/material-options/verifyProductMaterialOptions"
    );

    const result = await verifyProductMaterialOptions(
      [{ materialId, allowedColorIds: [colorId] }],
      [{ materialId, allowedColorIds: [colorId] }],
    );

    expect(result).toEqual({
      ok: true,
      materialOptions: [{ materialId, allowedColorIds: [colorId] }],
    });
  });

  it("rejects colors not linked to the material", async () => {
    const materialId = "507f1f77bcf86cd799439011";
    const colorId = "507f1f77bcf86cd799439012";

    materialFindMock.mockResolvedValue([
      { _id: materialId, isActive: true, colorIds: [] },
    ]);
    colorFindMock.mockResolvedValue([{ _id: colorId, isActive: true }]);

    const { verifyProductMaterialOptions } = await import(
      "@/lib/products/material-options/verifyProductMaterialOptions"
    );

    const result = await verifyProductMaterialOptions([
      { materialId, allowedColorIds: [colorId] },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("הצבע שנבחר אינו שייך לחומר זה");
    }
  });
});
