import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/cms/cms-defaults";
import type { HomepageHeroFormInput } from "@/lib/cms/cms-validation";

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(),
}));

const saveHomepageHeroMock = vi.fn();
const revalidateHomepagePathsMock = vi.fn();

vi.mock("@/lib/cms/homepage-content-mutations", () => ({
  saveHomepageHero: saveHomepageHeroMock,
  HomepageContentMutationError: class HomepageContentMutationError extends Error {},
}));

vi.mock("@/lib/cms/revalidate-homepage-paths", () => ({
  revalidateHomepagePaths: revalidateHomepagePathsMock,
}));

describe("saveHomepageHeroAction", () => {
  beforeEach(() => {
    saveHomepageHeroMock.mockReset();
    revalidateHomepagePathsMock.mockReset();
    saveHomepageHeroMock.mockResolvedValue(undefined);
    revalidateHomepagePathsMock.mockResolvedValue(undefined);
  });

  it("requires admin before saving", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("redirect"));

    const { saveHomepageHeroAction } = await import(
      "@/app/admin/content/homepage/actions"
    );

    await expect(
      saveHomepageHeroAction({
        ...DEFAULT_HOMEPAGE_CONTENT.hero,
        isVisible: true,
      } as HomepageHeroFormInput),
    ).rejects.toThrow("redirect");
  });

  it("saves hero and revalidates homepage paths", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    vi.mocked(requireAdmin).mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      email: "admin@example.com",
      role: "admin",
      accountStatus: "approved",
      requestedRole: null,
    });

    const { saveHomepageHeroAction } = await import(
      "@/app/admin/content/homepage/actions"
    );

    const result = await saveHomepageHeroAction({
      ...DEFAULT_HOMEPAGE_CONTENT.hero,
      isVisible: true,
    } as HomepageHeroFormInput);

    expect(result.success).toBe(true);
    expect(saveHomepageHeroMock).toHaveBeenCalled();
    expect(revalidateHomepagePathsMock).toHaveBeenCalled();
  });
});
