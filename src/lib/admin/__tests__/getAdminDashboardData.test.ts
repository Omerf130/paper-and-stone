import { describe, expect, it, vi, beforeEach } from "vitest";

const projectCountDocumentsMock = vi.fn();
const projectFindMock = vi.fn();
const productCountDocumentsMock = vi.fn();
const categoryCountDocumentsMock = vi.fn();
const materialCountDocumentsMock = vi.fn();
const colorCountDocumentsMock = vi.fn();
const userCountDocumentsMock = vi.fn();
const unreadCountMock = vi.fn();
const pendingArchitectRequestsMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    countDocuments: projectCountDocumentsMock,
    find: projectFindMock,
  },
}));

vi.mock("@/models/Product", () => ({
  default: {
    countDocuments: productCountDocumentsMock,
  },
}));

vi.mock("@/models/Category", () => ({
  default: {
    countDocuments: categoryCountDocumentsMock,
  },
}));

vi.mock("@/models/Material", () => ({
  default: {
    countDocuments: materialCountDocumentsMock,
  },
}));

vi.mock("@/models/Color", () => ({
  default: {
    countDocuments: colorCountDocumentsMock,
  },
}));

vi.mock("@/models/User", () => ({
  default: {
    countDocuments: userCountDocumentsMock,
  },
}));

vi.mock("@/lib/project-messages/getUnreadAdminProjectMessageCount", () => ({
  getUnreadAdminProjectMessageCount: unreadCountMock,
}));

const quoteAttentionMock = vi.fn();

vi.mock("@/lib/quotes/quote-queries", () => ({
  getAdminQuoteAttentionSummary: quoteAttentionMock,
}));

vi.mock("@/lib/users/architect-request-queries", () => ({
  countPendingArchitectRequests: pendingArchitectRequestsMock,
}));

describe("getAdminDashboardData", () => {
  beforeEach(() => {
    projectCountDocumentsMock.mockReset();
    projectFindMock.mockReset();
    productCountDocumentsMock.mockReset();
    categoryCountDocumentsMock.mockReset();
    materialCountDocumentsMock.mockReset();
    colorCountDocumentsMock.mockReset();
    userCountDocumentsMock.mockReset();
    unreadCountMock.mockReset();
    quoteAttentionMock.mockReset();
    pendingArchitectRequestsMock.mockReset();

    projectCountDocumentsMock.mockResolvedValue(3);
    unreadCountMock.mockResolvedValue(2);
    quoteAttentionMock.mockResolvedValue({
      quoteAcceptedAwaitingApprovalCount: 1,
      quoteChangeRequestedCount: 2,
      quoteAwaitingProfessionalCount: 3,
    });
    pendingArchitectRequestsMock.mockResolvedValue(2);
    productCountDocumentsMock
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(4);
    categoryCountDocumentsMock.mockResolvedValue(6);
    materialCountDocumentsMock.mockResolvedValue(8);
    colorCountDocumentsMock.mockResolvedValue(12);
    userCountDocumentsMock.mockResolvedValue(5);
    projectFindMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
              {
                _id: { toString: () => "507f1f77bcf86cd799439013" },
                name: "Project A",
                submittedAt: new Date("2026-01-01T10:00:00.000Z"),
              },
            ]),
          }),
        }),
      }),
    });
  });

  it("maps dashboard counts and recent projects", async () => {
    const { getAdminDashboardData } = await import(
      "@/lib/admin/getAdminDashboardData"
    );

    const data = await getAdminDashboardData("507f1f77bcf86cd799439011");

    expect(data.submittedProjectCount).toBe(3);
    expect(data.unreadAdminMessageCount).toBe(2);
    expect(data.quoteAcceptedAwaitingApprovalCount).toBe(1);
    expect(data.quoteChangeRequestedCount).toBe(2);
    expect(data.quoteAwaitingArchitectCount).toBe(3);
    expect(data.pendingArchitectRequestCount).toBe(2);
    expect(data.metrics).toEqual({
      activeProducts: 10,
      featuredProducts: 4,
      activeCategories: 6,
      activeMaterials: 8,
      activeColors: 12,
      activeArchitects: 5,
    });
    expect(data.recentSubmittedProjects).toEqual([
      {
        id: "507f1f77bcf86cd799439013",
        name: "Project A",
        submittedAt: "2026-01-01T10:00:00.000Z",
      },
    ]);
  });
});
