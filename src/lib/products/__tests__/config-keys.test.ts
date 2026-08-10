import { describe, expect, it } from "vitest";
import {
  createColorKey,
  createFabricKey,
  createSizeKey,
} from "@/lib/products/config-keys";

describe("config keys", () => {
  it("generates stable keys without random identifiers", () => {
    const fabricKey = createFabricKey("Velvet", []);
    expect(fabricKey).toBe("velvet");
  });

  it("avoids collisions within the same product structure", () => {
    const first = createFabricKey("Velvet", []);
    const second = createFabricKey("Velvet", [first]);
    expect(second).toBe("velvet-2");
  });

  it("generates color and size keys independently", () => {
    expect(createColorKey("Blue", [])).toBe("blue");
    expect(createSizeKey("220 cm", [])).toBe("220-cm");
  });
});
