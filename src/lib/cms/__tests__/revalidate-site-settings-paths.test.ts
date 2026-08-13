import { describe, expect, it, vi } from "vitest";

const revalidateTagMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
  revalidatePath: revalidatePathMock,
}));

describe("revalidate-site-settings-paths", () => {
  it("revalidates cache tag and public routes", async () => {
    revalidateTagMock.mockReset();
    revalidatePathMock.mockReset();

    const { revalidateSiteSettingsPaths } = await import(
      "@/lib/cms/revalidate-site-settings-paths"
    );

    await revalidateSiteSettingsPaths();

    expect(revalidateTagMock).toHaveBeenCalledWith("site-settings", { expire: 0 });
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/products");
    expect(revalidatePathMock).toHaveBeenCalledWith("/login");
    expect(revalidatePathMock).toHaveBeenCalledWith("/register");
  });
});
