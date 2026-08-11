import { describe, expect, it, vi, beforeEach } from "vitest";

const delMock = vi.fn();

vi.mock("@vercel/blob", () => ({
  del: (...args: unknown[]) => delMock(...args),
}));

describe("vercel-blob-storage-provider", () => {
  beforeEach(() => {
    delMock.mockReset();
    delMock.mockResolvedValue(undefined);
  });

  it("deletes blob by storage key best-effort", async () => {
    const { vercelBlobStorageProvider } = await import(
      "@/lib/media/vercel-blob-storage-provider"
    );

    await vercelBlobStorageProvider.delete("products/abc/primary/file.jpg");
    expect(delMock).toHaveBeenCalledWith("products/abc/primary/file.jpg");
  });

  it("does not throw when delete fails", async () => {
    delMock.mockRejectedValue(new Error("not found"));
    const { vercelBlobStorageProvider } = await import(
      "@/lib/media/vercel-blob-storage-provider"
    );

    await expect(
      vercelBlobStorageProvider.delete("products/abc/primary/file.jpg"),
    ).resolves.toBeUndefined();
  });

  it("rejects server-side upload", async () => {
    const { vercelBlobStorageProvider } = await import(
      "@/lib/media/vercel-blob-storage-provider"
    );

    await expect(
      vercelBlobStorageProvider.upload({
        key: "x",
        data: Buffer.from(""),
        contentType: "image/jpeg",
      }),
    ).rejects.toThrow("client upload");
  });
});
