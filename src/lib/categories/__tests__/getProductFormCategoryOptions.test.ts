import { describe, expect, it, vi, beforeEach } from "vitest";

const findMock = vi.fn();
const findByIdMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Category", () => ({
  default: {
    find: findMock,
    findById: findByIdMock,
  },
}));

describe("getProductFormCategoryOptions", () => {
  beforeEach(() => {
    findMock.mockReset();
    findByIdMock.mockReset();

    findMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: { toString: () => "active-1" },
              nameHe: "שולחנות",
              isActive: true,
            },
          ]),
        }),
      }),
    });
  });

  it("returns only active categories for create flow", async () => {
    const { getProductFormCategoryOptions } = await import(
      "@/lib/categories/getProductFormCategoryOptions"
    );
    const options = await getProductFormCategoryOptions();

    expect(findMock).toHaveBeenCalledWith({ isActive: true });
    expect(options).toEqual([
      { id: "active-1", nameHe: "שולחנות", isActive: true },
    ]);
  });

  it("includes inactive current category for edit flow", async () => {
    findByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: { toString: () => "inactive-1" },
          nameHe: "ספות",
          isActive: false,
        }),
      }),
    });

    const { getProductFormCategoryOptions } = await import(
      "@/lib/categories/getProductFormCategoryOptions"
    );
    const options = await getProductFormCategoryOptions("inactive-1");

    expect(options).toHaveLength(2);
    expect(options[1]).toEqual({
      id: "inactive-1",
      nameHe: "ספות",
      isActive: false,
    });
  });
});
