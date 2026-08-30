import { describe, expect, it, vi, beforeEach } from "vitest";

const projectCountMock = vi.fn();
const quoteCountMock = vi.fn();
const findByIdMock = vi.fn();
const findByIdAndDeleteMock = vi.fn();
const deleteOldBlobBestEffortMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    countDocuments: projectCountMock,
  },
}));

vi.mock("@/models/ProjectQuote", () => ({
  default: {
    countDocuments: quoteCountMock,
  },
}));

vi.mock("@/models/Product", () => ({
  default: {
    findById: findByIdMock,
    findByIdAndDelete: findByIdAndDeleteMock,
  },
}));

vi.mock("@/lib/media/product-media-mutations", () => ({
  deleteOldBlobBestEffort: deleteOldBlobBestEffortMock,
}));

describe("deleteProduct", () => {
  beforeEach(() => {
    projectCountMock.mockReset();
    quoteCountMock.mockReset();
    findByIdMock.mockReset();
    findByIdAndDeleteMock.mockReset();
    deleteOldBlobBestEffortMock.mockReset();
    projectCountMock.mockResolvedValue(0);
    quoteCountMock.mockResolvedValue(0);
    findByIdAndDeleteMock.mockResolvedValue({});
    deleteOldBlobBestEffortMock.mockResolvedValue(undefined);
  });

  it("blocks deletion when product is referenced by a project item", async () => {
    projectCountMock.mockResolvedValueOnce(1);
    findByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          media: {},
        }),
      }),
    });

    const { deleteProduct } = await import("@/lib/products/product-mutations");
    const { ProductMutationError } = await import(
      "@/lib/products/product-mutations"
    );

    await expect(
      deleteProduct("507f1f77bcf86cd799439011"),
    ).rejects.toBeInstanceOf(ProductMutationError);

    expect(findByIdAndDeleteMock).not.toHaveBeenCalled();
  });

  it("deletes product and cleans up media blobs", async () => {
    findByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          media: {
            primaryImage: { storageKey: "products/a.jpg" },
            gallery: [{ storageKey: "products/b.jpg" }],
          },
        }),
      }),
    });

    const { deleteProduct } = await import("@/lib/products/product-mutations");

    await deleteProduct("507f1f77bcf86cd799439011");

    expect(findByIdAndDeleteMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
    );
    expect(deleteOldBlobBestEffortMock).toHaveBeenCalledWith("products/a.jpg");
    expect(deleteOldBlobBestEffortMock).toHaveBeenCalledWith("products/b.jpg");
  });
});
