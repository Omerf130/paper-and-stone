import { describe, expect, it } from "vitest";
import ProfessionalProfile from "@/models/ProfessionalProfile";

describe("ProfessionalProfile model", () => {
  it("declares unique userId index", () => {
    const userIdPath = ProfessionalProfile.schema.path("userId");
    expect(userIdPath.options.unique).toBe(true);
    expect(userIdPath.options.required).toBe(true);
  });
});
