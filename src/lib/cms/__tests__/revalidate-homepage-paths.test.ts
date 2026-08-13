import { describe, expect, it, vi } from "vitest";

const revalidateTagMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
  revalidatePath: revalidatePathMock,
}));

describe("revalidate-homepage-paths", () => {
  it("revalidates homepage cache tag and public routes", async () => {
    revalidateTagMock.mockReset();
    revalidatePathMock.mockReset();

    const { revalidateHomepagePaths, HOMEPAGE_CONTENT_CACHE_TAG } = await import(
      "@/lib/cms/revalidate-homepage-paths"
    );

    await revalidateHomepagePaths();

    expect(HOMEPAGE_CONTENT_CACHE_TAG).toBe("homepage-content");
    expect(revalidateTagMock).toHaveBeenCalledWith("homepage-content", {
      expire: 0,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/content/homepage");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });
});
