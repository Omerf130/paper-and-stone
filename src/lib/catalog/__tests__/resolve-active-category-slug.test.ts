import { describe, expect, it, vi, beforeEach } from "vitest";

const findOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Category", () => ({
  default: {
    findOne: findOneMock,
  },
}));

describe("resolveActiveCategorySlug", () => {
  beforeEach(() => {
    findOneMock.mockReset();
  });

  it("returns null for empty slug", async () => {
    const { resolveActiveCategorySlug } = await import(
      "@/lib/catalog/resolve-active-category-slug"
    );

    await expect(resolveActiveCategorySlug(null)).resolves.toBeNull();
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("returns category id for active slug", async () => {
    const categoryId = { toString: () => "507f1f77bcf86cd799439011" };

    findOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: categoryId }),
      }),
    });

    const { resolveActiveCategorySlug } = await import(
      "@/lib/catalog/resolve-active-category-slug"
    );
    const result = await resolveActiveCategorySlug("sofas");

    expect(findOneMock).toHaveBeenCalledWith({ slug: "sofas", isActive: true });
    expect(result).toBe(categoryId);
  });

  it("returns null for unknown or inactive slug", async () => {
    findOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      }),
    });

    const { resolveActiveCategorySlug } = await import(
      "@/lib/catalog/resolve-active-category-slug"
    );

    await expect(resolveActiveCategorySlug("missing")).resolves.toBeNull();
  });
});
