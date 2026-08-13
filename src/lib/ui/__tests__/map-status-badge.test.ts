import { describe, expect, it } from "vitest";
import {
  mapEntityActiveToBadge,
  mapProductFeaturedToBadge,
  mapProjectStatusToBadge,
} from "@/lib/ui/map-status-badge";

describe("map-status-badge", () => {
  it("maps project statuses to tones", () => {
    expect(mapProjectStatusToBadge("approved")).toEqual({
      label: "מאושר",
      tone: "positive",
    });
    expect(mapProjectStatusToBadge("rejected").tone).toBe("negative");
    expect(mapProjectStatusToBadge("submitted").tone).toBe("info");
    expect(mapProjectStatusToBadge("changes_requested").tone).toBe("warning");
    expect(mapProjectStatusToBadge("draft").tone).toBe("neutral");
  });

  it("maps entity active state", () => {
    expect(mapEntityActiveToBadge(true)).toEqual({
      label: "פעיל",
      tone: "positive",
    });
    expect(mapEntityActiveToBadge(false)).toEqual({
      label: "לא פעיל",
      tone: "neutral",
    });
  });

  it("maps product featured state", () => {
    expect(mapProductFeaturedToBadge(true)).toEqual({
      label: "מומלץ",
      tone: "positive",
    });
    expect(mapProductFeaturedToBadge(false)).toEqual({
      label: "רגיל",
      tone: "neutral",
    });
  });
});
