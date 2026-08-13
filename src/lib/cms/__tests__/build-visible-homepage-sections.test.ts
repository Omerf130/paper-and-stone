import { describe, expect, it } from "vitest";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/cms/cms-defaults";
import { buildVisibleHomepageSections } from "@/lib/cms/build-visible-homepage-sections";
import { mapHomepageToPublic } from "@/lib/cms/map-homepage-to-public";

function buildPublicHomepage() {
  return mapHomepageToPublic(DEFAULT_HOMEPAGE_CONTENT, new Map());
}

describe("build-visible-homepage-sections", () => {
  it("returns sections in CMS order when visible", () => {
    const homepage = buildPublicHomepage();
    homepage.sectionOrder = [
      "closing",
      "hero",
      "about",
      "categories",
      "featuredProducts",
      "professionals",
      "inspiration",
    ];

    expect(buildVisibleHomepageSections(homepage, 3)).toEqual([
      "closing",
      "hero",
      "about",
      "categories",
      "featuredProducts",
      "professionals",
      "inspiration",
    ]);
  });

  it("skips hidden sections and featured when there are no products", () => {
    const homepage = buildPublicHomepage();
    homepage.sectionVisibility.featuredProducts = true;
    homepage.sectionVisibility.about = false;

    expect(buildVisibleHomepageSections(homepage, 0)).not.toContain("featuredProducts");
    expect(buildVisibleHomepageSections(homepage, 0)).not.toContain("about");
  });

  it("always includes hero even when CMS order omits it", () => {
    const homepage = buildPublicHomepage();
    homepage.sectionOrder = ["categories", "about"];

    expect(buildVisibleHomepageSections(homepage, 1)[0]).toBe("hero");
  });

  it("ignores unknown section keys", () => {
    const homepage = buildPublicHomepage();
    homepage.sectionOrder = ["hero", "unknown" as never, "about"];

    expect(buildVisibleHomepageSections(homepage, 1)).toEqual(["hero", "about"]);
  });
});
