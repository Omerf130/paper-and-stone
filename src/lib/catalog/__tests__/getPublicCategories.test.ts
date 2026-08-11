import { describe, expect, it, vi, beforeEach } from "vitest";

const findMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Category", () => ({
  default: {
    find: findMock,
  },
}));

describe("getPublicCategories", () => {
  beforeEach(() => {
    findMock.mockReset();
    findMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            { slug: "sofas", nameHe: "ספות" },
          ]),
        }),
      }),
    });
  });

  it("returns active categories only with public fields", async () => {
    const { getPublicCategories } = await import(
      "@/lib/catalog/getPublicCategories"
    );
    const categories = await getPublicCategories();

    expect(findMock).toHaveBeenCalledWith({ isActive: true });
    expect(categories).toEqual([{ slug: "sofas", nameHe: "ספות" }]);
  });
});
