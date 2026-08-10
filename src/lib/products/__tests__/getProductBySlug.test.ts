import { describe, expect, it, vi, beforeEach } from "vitest";

const findOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Product", () => ({
  default: {
    findOne: findOneMock,
  },
}));

vi.mock("@/models/Category", () => ({
  default: {},
}));

vi.mock("@/lib/products/mapProductToView", () => ({
  mapProductToView: vi.fn(() => ({ slug: "milano-sofa" })),
}));

describe("getProductBySlug", () => {
  beforeEach(() => {
    findOneMock.mockReset();
    findOneMock.mockReturnValue({
      populate: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      }),
    });
  });

  it("queries only active products", async () => {
    const { getProductBySlug } = await import("@/lib/products/getProductBySlug");
    await getProductBySlug("milano-sofa");

    expect(findOneMock).toHaveBeenCalledWith({
      slug: "milano-sofa",
      isActive: true,
    });
  });
});
