import { beforeEach, describe, expect, it, vi } from "vitest";

const findOneAndUpdateMock = vi.fn();
const connectDBMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: connectDBMock,
}));

vi.mock("@/models/SiteSettings", () => ({
  default: {
    findOneAndUpdate: (...args: unknown[]) => findOneAndUpdateMock(...args),
  },
}));

describe("site-settings-mutations", () => {
  beforeEach(() => {
    findOneAndUpdateMock.mockReset();
    connectDBMock.mockReset();
    findOneAndUpdateMock.mockResolvedValue({});
  });

  it("upserts singleton site settings by key", async () => {
    const { upsertSiteSettings } = await import("@/lib/cms/site-settings-mutations");

    await upsertSiteSettings({
      brandName: "Paper & Stone",
      footerDescription: "ריהוט, חומרים ופתרונות לפרויקטים",
    });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { key: "site" },
      expect.objectContaining({
        $set: expect.objectContaining({
          key: "site",
          brandName: "Paper & Stone",
        }),
      }),
      expect.objectContaining({ upsert: true }),
    );
  });
});
