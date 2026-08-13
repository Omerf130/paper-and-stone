import { describe, expect, it } from "vitest";
import { isActiveInternalPath } from "@/lib/navigation/is-active-internal-path";

describe("isActiveInternalPath", () => {
  it("matches dashboard roots exactly", () => {
    expect(isActiveInternalPath("/professional", "/professional")).toBe(true);
    expect(isActiveInternalPath("/professional/projects", "/professional")).toBe(
      false,
    );
    expect(isActiveInternalPath("/admin", "/admin")).toBe(true);
    expect(isActiveInternalPath("/admin/products", "/admin")).toBe(false);
  });

  it("matches nested routes by prefix", () => {
    expect(
      isActiveInternalPath("/professional/projects/abc", "/professional/projects"),
    ).toBe(true);
    expect(
      isActiveInternalPath("/admin/products/1", "/admin/products"),
    ).toBe(true);
  });
});
