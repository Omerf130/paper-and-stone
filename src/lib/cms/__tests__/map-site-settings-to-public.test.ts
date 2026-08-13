import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/cms-defaults";
import { mapSiteSettingsToPublic } from "@/lib/cms/map-site-settings-to-public";

describe("map-site-settings-to-public", () => {
  it("strips storageKey from public logo view", () => {
    const publicView = mapSiteSettingsToPublic({
      ...DEFAULT_SITE_SETTINGS,
      logo: {
        url: "https://example.com/logo.png",
        storageKey: "cms/site/logo/test.png",
      },
    });

    expect(publicView.logo).toEqual({
      url: "https://example.com/logo.png",
      alt: DEFAULT_SITE_SETTINGS.brandName,
    });
    expect(publicView.logo).not.toHaveProperty("storageKey");
  });

  it("derives logo alt from brand name when missing", () => {
    const publicView = mapSiteSettingsToPublic({
      ...DEFAULT_SITE_SETTINGS,
      logo: {
        url: "https://example.com/logo.png",
        storageKey: "cms/site/logo/test.png",
        alt: "Paper & Stone logo",
      },
    });

    expect(publicView.logo?.alt).toBe("Paper & Stone logo");
  });

  it("marks contact availability without placeholder rows", () => {
    const withContact = mapSiteSettingsToPublic({
      ...DEFAULT_SITE_SETTINGS,
      contactEmail: "info@paper-stone.co.il",
    });

    expect(withContact.hasContactDetails).toBe(true);
    expect(withContact.contactItems).toHaveLength(1);

    const withoutContact = mapSiteSettingsToPublic(DEFAULT_SITE_SETTINGS);
    expect(withoutContact.hasContactDetails).toBe(false);
  });
});
