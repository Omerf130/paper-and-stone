import { describe, expect, it } from "vitest";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/cms/cms-defaults";
import {
  mapHomepageToPublic,
  splitAboutBody,
} from "@/lib/cms/map-homepage-to-public";

describe("map-homepage-to-public", () => {
  it("splits about body on the first blank line", () => {
    expect(
      splitAboutBody(
        "Lead paragraph.\n\nSecond paragraph with more detail.",
      ),
    ).toEqual({
      lead: "Lead paragraph.",
      body: "Second paragraph with more detail.",
    });
  });

  it("does not leak internal CMS fields", () => {
    const publicView = mapHomepageToPublic(DEFAULT_HOMEPAGE_CONTENT, new Map());
    const serialized = JSON.stringify(publicView);

    expect(serialized).not.toContain("storageKey");
    expect(serialized).not.toContain("schemaVersion");
    expect(publicView).not.toHaveProperty("key");
  });

  it("maps decorative images to empty alt text", () => {
    const content = structuredClone(DEFAULT_HOMEPAGE_CONTENT);
    content.hero.image = {
      url: "https://example.com/hero.jpg",
      storageKey: "cms/homepage/hero.jpg",
      alt: "Hero image",
      isDecorative: true,
      width: 1600,
      height: 900,
    };

    const publicView = mapHomepageToPublic(content, new Map());

    expect(publicView.hero.image).toEqual({
      url: "https://example.com/hero.jpg",
      alt: "",
      width: 1600,
      height: 900,
    });
  });

  it("shows the inspiration demo note until inspiration is content-managed", () => {
    const defaults = mapHomepageToPublic(DEFAULT_HOMEPAGE_CONTENT, new Map());
    expect(defaults.inspiration.showDemoNote).toBe(true);

    const managed = structuredClone(DEFAULT_HOMEPAGE_CONTENT);
    managed.inspiration.isContentManaged = true;

    expect(mapHomepageToPublic(managed, new Map()).inspiration.showDemoNote).toBe(
      false,
    );
  });
});
