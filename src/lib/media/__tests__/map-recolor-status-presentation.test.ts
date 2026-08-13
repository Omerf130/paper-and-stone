import { describe, expect, it } from "vitest";
import {
  mapRecolorStatusPresentation,
  mapRecolorStatusToFeedbackTone,
} from "@/lib/media/map-recolor-status-presentation";

describe("mapRecolorStatusPresentation", () => {
  it("maps known statuses to Hebrew messages", () => {
    expect(mapRecolorStatusPresentation("missing_primary").message).toContain(
      "תמונה ראשית",
    );
    expect(mapRecolorStatusPresentation("missing_mask").message).toContain(
      "מסכת",
    );
    expect(mapRecolorStatusPresentation("invalid_source").message).toContain(
      "התמונה הראשית השתנתה",
    );
    expect(mapRecolorStatusPresentation("ready").message).toContain("מוכנה");
  });

  it("returns neutral fallback for unknown status", () => {
    const result = mapRecolorStatusPresentation("unknown");
    expect(result.message).toContain("לא ניתן");
    expect(result.tone).toBe("neutral");
  });
});

describe("mapRecolorStatusToFeedbackTone", () => {
  it("maps statuses to feedback tones", () => {
    expect(mapRecolorStatusToFeedbackTone("missing_primary")).toBe("info");
    expect(mapRecolorStatusToFeedbackTone("missing_mask")).toBe("warning");
    expect(mapRecolorStatusToFeedbackTone("invalid_source")).toBe("warning");
    expect(mapRecolorStatusToFeedbackTone("ready")).toBe("success");
    expect(mapRecolorStatusPresentation("ready").tone).toBe("positive");
  });
});
