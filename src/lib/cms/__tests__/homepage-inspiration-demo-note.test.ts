import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/cms/cms-defaults";
import type { HomepageInspirationFormInput } from "@/lib/cms/cms-validation";

const connectDBMock = vi.fn();
const existsMock = vi.fn();
const findOneAndUpdateMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: connectDBMock,
}));

vi.mock("@/models/HomepageContent", () => ({
  default: {
    exists: existsMock,
    findOneAndUpdate: findOneAndUpdateMock,
  },
}));

describe("homepage inspiration demo-note state", () => {
  beforeEach(() => {
    connectDBMock.mockReset();
    existsMock.mockReset();
    findOneAndUpdateMock.mockReset();
    connectDBMock.mockResolvedValue(undefined);
    findOneAndUpdateMock.mockResolvedValue(undefined);
  });

  it("keeps inspiration unmanaged after a hero-only save creates the document", async () => {
    existsMock.mockResolvedValue(null);

    const { saveHomepageHero } = await import("@/lib/cms/homepage-content-mutations");

    const heroInput = {
      eyebrow: DEFAULT_HOMEPAGE_CONTENT.hero.eyebrow,
      heading: DEFAULT_HOMEPAGE_CONTENT.hero.heading,
      supportingText: DEFAULT_HOMEPAGE_CONTENT.hero.supportingText,
      primaryCta: DEFAULT_HOMEPAGE_CONTENT.hero.primaryCta,
      secondaryCta: DEFAULT_HOMEPAGE_CONTENT.hero.secondaryCta,
      isVisible: true as const,
    };

    await saveHomepageHero(heroInput);

    expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
    const updatePayload = findOneAndUpdateMock.mock.calls[0]?.[1]?.$set as
      | Record<string, unknown>
      | undefined;

    expect(updatePayload?.inspiration).toMatchObject({
      isContentManaged: false,
    });
  });

  it("marks inspiration as content-managed when the inspiration section is saved", async () => {
    existsMock.mockResolvedValue({ _id: "homepage-doc" });

    const { saveHomepageInspiration } = await import(
      "@/lib/cms/homepage-content-mutations"
    );

    const inspirationInput: HomepageInspirationFormInput = {
      eyebrow: DEFAULT_HOMEPAGE_CONTENT.inspiration.eyebrow,
      heading: DEFAULT_HOMEPAGE_CONTENT.inspiration.heading,
      supportingText: DEFAULT_HOMEPAGE_CONTENT.inspiration.supportingText,
      items: DEFAULT_HOMEPAGE_CONTENT.inspiration.items.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        layout: item.layout,
        isVisible: item.isVisible,
        order: item.order,
      })),
      isVisible: true,
    };

    await saveHomepageInspiration(inspirationInput);

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { key: "homepage" },
      {
        $set: expect.objectContaining({
          inspiration: expect.objectContaining({
            isContentManaged: true,
          }),
        }),
      },
      { runValidators: true },
    );
  });
});
