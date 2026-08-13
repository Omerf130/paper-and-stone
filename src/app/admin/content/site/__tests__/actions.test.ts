import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/authorization", () => ({
  requireAdmin: vi.fn(),
}));

const upsertSiteSettingsMock = vi.fn();
const revalidateSiteSettingsPathsMock = vi.fn();

vi.mock("@/lib/cms/site-settings-mutations", () => ({
  upsertSiteSettings: upsertSiteSettingsMock,
  SiteSettingsMutationError: class SiteSettingsMutationError extends Error {},
}));

vi.mock("@/lib/cms/revalidate-site-settings-paths", () => ({
  revalidateSiteSettingsPaths: revalidateSiteSettingsPathsMock,
}));

describe("updateSiteSettingsAction", () => {
  beforeEach(() => {
    upsertSiteSettingsMock.mockReset();
    revalidateSiteSettingsPathsMock.mockReset();
    upsertSiteSettingsMock.mockResolvedValue(undefined);
    revalidateSiteSettingsPathsMock.mockResolvedValue(undefined);
  });

  it("requires admin before saving", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("redirect"));

    const { updateSiteSettingsAction } = await import(
      "@/app/admin/content/site/actions"
    );

    await expect(
      updateSiteSettingsAction({
        brandName: "Paper & Stone",
        contactEmail: "",
        contactPhone: "",
        whatsappPhone: "",
        address: "",
        footerDescription: "ריהוט, חומרים ופתרונות לפרויקטים",
        copyrightCompanyName: "",
        seoDefaultTitle: "",
        seoDefaultDescription: "",
      }),
    ).rejects.toThrow("redirect");
  });

  it("upserts validated site settings and revalidates", async () => {
    const { requireAdmin } = await import("@/lib/auth/authorization");
    vi.mocked(requireAdmin).mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      email: "admin@example.com",
      role: "admin",
    });

    const { updateSiteSettingsAction } = await import(
      "@/app/admin/content/site/actions"
    );

    const result = await updateSiteSettingsAction({
      brandName: "Paper & Stone",
      contactEmail: "info@example.com",
      contactPhone: "",
      whatsappPhone: "",
      address: "",
      footerDescription: "ריהוט, חומרים ופתרונות לפרויקטים",
      copyrightCompanyName: "",
      seoDefaultTitle: "",
      seoDefaultDescription: "",
    });

    expect(result.success).toBe(true);
    expect(upsertSiteSettingsMock).toHaveBeenCalled();
    expect(revalidateSiteSettingsPathsMock).toHaveBeenCalled();
  });
});
