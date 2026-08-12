import { describe, expect, it } from "vitest";
import { parseProjectFormInput, parseAddToProjectInput } from "@/lib/projects/project-validation";

describe("project-validation", () => {
  it("requires project name", () => {
    const result = parseProjectFormInput({ name: " " });
    expect(result.success).toBe(false);
  });

  it("accepts valid project form input", () => {
    const result = parseProjectFormInput({
      name: "פרויקט דירה",
      clientName: "לקוח",
    });

    expect(result.success).toBe(true);
  });

  it("validates add-to-project quantity bounds", () => {
    const result = parseAddToProjectInput({
      projectId: "507f1f77bcf86cd799439011",
      productSlug: "milano-sofa",
      quantity: 1000,
    });

    expect(result.success).toBe(false);
  });
});
