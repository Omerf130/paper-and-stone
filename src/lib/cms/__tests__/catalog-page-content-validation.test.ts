import { describe, expect, it } from "vitest";
import {
  mapCatalogPageContentFormToWriteFields,
  parseCatalogPageContentFormInput,
} from "@/lib/cms/cms-validation";

describe("catalog-page-content-validation", () => {
  it("accepts valid catalog form input", () => {
    const parsed = parseCatalogPageContentFormInput({
      eyebrow: "Paper & Stone",
      heading: "מוצרים",
      supportingText: "מבחר מוצרים פעילים מ-Paper & Stone.",
    });

    expect(parsed.success).toBe(true);
  });

  it("returns field errors for missing required fields", () => {
    const parsed = parseCatalogPageContentFormInput({
      eyebrow: "",
      heading: "",
      supportingText: "",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.fieldErrors.eyebrow).toBe("נא להזין כותרת עליונה.");
      expect(parsed.fieldErrors.heading).toBe("נא להזין כותרת.");
      expect(parsed.fieldErrors.supportingText).toBe("נא להזין טקסט תומך.");
    }
  });

  it("maps trimmed form fields to write fields", () => {
    expect(
      mapCatalogPageContentFormToWriteFields({
        eyebrow: "  Paper & Stone  ",
        heading: "  מוצרים  ",
        supportingText: "  מבחר מוצרים  ",
      }),
    ).toEqual({
      eyebrow: "Paper & Stone",
      heading: "מוצרים",
      supportingText: "מבחר מוצרים",
    });
  });
});
