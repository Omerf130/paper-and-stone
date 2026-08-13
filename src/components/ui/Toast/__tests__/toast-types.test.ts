import { describe, expect, it } from "vitest";
import type { ToastType } from "@/components/ui/Toast/toast-types";

describe("toast-types", () => {
  it("supports expected toast types", () => {
    const types: ToastType[] = ["success", "error", "warning", "info"];
    expect(types).toHaveLength(4);
  });
});
