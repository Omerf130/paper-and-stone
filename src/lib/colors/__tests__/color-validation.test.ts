import { describe, expect, it } from "vitest";
import {
  mapColorInputToWriteFields,
  parseColorFormInput,
} from "@/lib/colors/color-validation";

describe("color-validation", () => {
  it("parses valid color input", () => {
    const parsed = parseColorFormInput({
      nameHe: "ירוק בקבוק",
      nameEn: "",
      code: " vel-001 ",
      hex: "#163f35",
      sortOrder: "2",
      isActive: true,
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const fields = mapColorInputToWriteFields(parsed.data);
      expect(fields).toEqual({
        nameHe: "ירוק בקבוק",
        code: "VEL-001",
        hex: "#163F35",
        sortOrder: 2,
        isActive: true,
      });
    }
  });

  it("rejects invalid hex", () => {
    const parsed = parseColorFormInput({
      nameHe: "צבע",
      nameEn: "",
      code: "",
      hex: "bad",
      sortOrder: "0",
      isActive: true,
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const fields = mapColorInputToWriteFields(parsed.data);
      expect(fields).toEqual({
        fieldErrors: {
          hex: "ערך HEX לא תקין. השתמשו בפורמט #RRGGBB",
        },
      });
    }
  });
});
