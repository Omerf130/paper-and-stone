import { describe, expect, it } from "vitest";
import { parseSiteSettingsFormInput } from "@/lib/cms/cms-validation";

describe("site-settings-form validation", () => {
  it("accepts valid site settings form input", () => {
    const result = parseSiteSettingsFormInput({
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
  });

  it("rejects invalid email", () => {
    const result = parseSiteSettingsFormInput({
      brandName: "Paper & Stone",
      contactEmail: "not-an-email",
      contactPhone: "",
      whatsappPhone: "",
      address: "",
      footerDescription: "ריהוט, חומרים ופתרונות לפרויקטים",
      copyrightCompanyName: "",
      seoDefaultTitle: "",
      seoDefaultDescription: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.contactEmail).toBeDefined();
    }
  });
});
