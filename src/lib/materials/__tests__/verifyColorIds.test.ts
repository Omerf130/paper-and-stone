import { describe, expect, it, vi, beforeEach } from "vitest";

const findMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Color", () => ({
  default: {
    find: (...args: unknown[]) => ({
      select: () => ({
        lean: () => findMock(...args),
      }),
    }),
  },
}));

describe("verifyMaterialColorIds", () => {
  beforeEach(() => {
    findMock.mockReset();
  });

  it("requires active colors on create", async () => {
    const colorId = "507f1f77bcf86cd799439011";
    findMock.mockResolvedValue([{ _id: colorId, isActive: false }]);

    const { verifyMaterialColorIds } = await import(
      "@/lib/materials/verifyColorIds"
    );

    const result = await verifyMaterialColorIds([colorId]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("לא ניתן להוסיף צבע לא פעיל");
    }
  });

  it("allows previously linked inactive colors on update", async () => {
    const colorId = "507f1f77bcf86cd799439011";
    findMock.mockResolvedValue([{ _id: colorId, isActive: false }]);

    const { verifyMaterialColorIds } = await import(
      "@/lib/materials/verifyColorIds"
    );

    const result = await verifyMaterialColorIds([colorId], [colorId]);
    expect(result).toEqual({ ok: true, colorIds: [colorId] });
  });

  it("rejects missing colors", async () => {
    const colorId = "507f1f77bcf86cd799439011";
    findMock.mockResolvedValue([]);

    const { verifyMaterialColorIds } = await import(
      "@/lib/materials/verifyColorIds"
    );

    const result = await verifyMaterialColorIds([colorId]);
    expect(result.ok).toBe(false);
  });
});
