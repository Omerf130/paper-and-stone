import { describe, expect, it, vi, beforeEach } from "vitest";

const projectFindByIdMock = vi.fn();
const projectQuoteExistsMock = vi.fn();
const projectQuoteFindOneMock = vi.fn();
const projectQuoteFindByIdMock = vi.fn();
const projectQuoteUpdateOneMock = vi.fn();
const projectFindOneMock = vi.fn();
const hasQuoteEverBeenSentMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    findById: projectFindByIdMock,
    findOne: projectFindOneMock,
  },
}));

vi.mock("@/models/ProjectQuote", () => ({
  default: {
    exists: projectQuoteExistsMock,
    findOne: projectQuoteFindOneMock,
    findById: projectQuoteFindByIdMock,
    updateOne: projectQuoteUpdateOneMock,
  },
}));

vi.mock("@/lib/quotes/supersedeActiveQuotes", () => ({
  supersedeActiveQuotes: vi.fn(),
  hasQuoteEverBeenSent: (...args: unknown[]) =>
    hasQuoteEverBeenSentMock(...args),
}));

describe("quote-mutations approval gate", () => {
  beforeEach(() => {
    projectFindByIdMock.mockReset();
    projectQuoteFindOneMock.mockReset();
    hasQuoteEverBeenSentMock.mockReset();
  });

  it("allows approval when no quote was ever sent", async () => {
    hasQuoteEverBeenSentMock.mockResolvedValue(false);
    projectFindByIdMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        onboardingStatus: null,
        submissionRevision: 0,
        items: [],
      }),
    });

    const { assertQuoteApprovalGate } = await import(
      "@/lib/quotes/quote-mutations"
    );

    await expect(
      assertQuoteApprovalGate("507f1f77bcf86cd799439013"),
    ).resolves.toBeUndefined();
  });

  it("blocks approval when quote-enabled project lacks accepted quote", async () => {
    hasQuoteEverBeenSentMock.mockResolvedValue(true);
    projectFindByIdMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({ submissionRevision: 3, onboardingStatus: null, items: [] }),
    });
    projectQuoteFindOneMock.mockReturnValue({
      sort: vi.fn().mockResolvedValue(null),
    });

    const { assertQuoteApprovalGate } = await import(
      "@/lib/quotes/quote-mutations"
    );
    const { QUOTE_ERRORS } = await import("@/lib/quotes/quote-errors");

    await expect(
      assertQuoteApprovalGate("507f1f77bcf86cd799439013"),
    ).rejects.toMatchObject({
      message: QUOTE_ERRORS.APPROVAL_REQUIRES_ACCEPTED_QUOTE,
    });
  });
});

describe("acceptProjectQuote", () => {
  beforeEach(() => {
    projectQuoteFindByIdMock.mockReset();
    projectFindOneMock.mockReset();
    projectQuoteUpdateOneMock.mockReset();
    projectQuoteUpdateOneMock.mockResolvedValue({ matchedCount: 1 });
  });

  it("is idempotent when quote already accepted", async () => {
    projectQuoteFindByIdMock.mockResolvedValue({
      _id: "507f1f77bcf86cd799439015",
      professionalUserId: { toString: () => "507f1f77bcf86cd799439011" },
      status: "accepted",
    });

    const { acceptProjectQuote } = await import("@/lib/quotes/quote-mutations");

    await acceptProjectQuote(
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439015",
    );

    expect(projectQuoteUpdateOneMock).not.toHaveBeenCalled();
  });

  it("accepts actionable sent quote for current revision", async () => {
    projectQuoteFindByIdMock.mockResolvedValue({
      _id: "507f1f77bcf86cd799439015",
      professionalUserId: { toString: () => "507f1f77bcf86cd799439011" },
      projectId: "507f1f77bcf86cd799439013",
      status: "sent",
      submissionRevision: 2,
    });
    projectFindOneMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: "507f1f77bcf86cd799439013",
        submissionRevision: 2,
        status: "submitted",
      }),
    });

    const { acceptProjectQuote } = await import("@/lib/quotes/quote-mutations");

    await acceptProjectQuote(
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439015",
    );

    expect(projectQuoteUpdateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "sent",
        submissionRevision: 2,
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          status: "accepted",
        }),
      }),
    );
  });
});
