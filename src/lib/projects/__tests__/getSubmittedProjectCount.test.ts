import { describe, expect, it, vi, beforeEach } from "vitest";

const countDocumentsMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    countDocuments: countDocumentsMock,
  },
}));

describe("getSubmittedProjectCount", () => {
  beforeEach(() => {
    countDocumentsMock.mockReset();
    countDocumentsMock.mockResolvedValue(7);
  });

  it("counts submitted projects", async () => {
    const { getSubmittedProjectCount } = await import(
      "@/lib/projects/getSubmittedProjectCount"
    );

    const count = await getSubmittedProjectCount();

    expect(count).toBe(7);
    expect(countDocumentsMock).toHaveBeenCalledWith({ status: "submitted" });
  });
});
