import { describe, expect, it, vi, beforeEach } from "vitest";

const findMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Product", () => ({
  default: {
    find: findMock,
  },
}));

vi.mock("@/models/Category", () => ({
  default: {},
}));

describe("getPublicProducts", () => {
  beforeEach(() => {
    findMock.mockReset();
    findMock.mockReturnValue({
      populate: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
  });

  it("queries only active products", async () => {
    const { getPublicProducts } = await import("@/lib/products/getPublicProducts");
    await getPublicProducts();

    expect(findMock).toHaveBeenCalledWith({ isActive: true });
  });
});
