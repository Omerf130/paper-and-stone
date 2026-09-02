import { describe, expect, it, vi, beforeEach } from "vitest";

const projectCountDocumentsMock = vi.fn();
const projectAggregateMock = vi.fn();
const productFindMock = vi.fn();
const unreadCountMock = vi.fn();
const pendingArchitectRequestsMock = vi.fn();
const pendingClientRequestsMock = vi.fn();
const countClientsMock = vi.fn();
const countArchitectsMock = vi.fn();
const activityFeedMock = vi.fn();
const queueSummaryMock = vi.fn();
const loadThumbnailsMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    countDocuments: projectCountDocumentsMock,
    aggregate: projectAggregateMock,
  },
}));

vi.mock("@/models/Product", () => ({
  default: {
    find: productFindMock,
  },
}));

vi.mock("@/lib/project-messages/getUnreadAdminProjectMessageCount", () => ({
  getUnreadAdminProjectMessageCount: unreadCountMock,
}));

const quoteAttentionMock = vi.fn();

vi.mock("@/lib/quotes/quote-queries", () => ({
  getAdminQuoteAttentionSummary: quoteAttentionMock,
}));

const attentionCountMock = vi.fn();
const activeCountMock = vi.fn();

vi.mock("@/lib/projects/getAdminProjects", () => ({
  getAdminProjectAttentionCount: attentionCountMock,
  getActiveProjectCount: activeCountMock,
  getAdminProjectsQueueSummary: queueSummaryMock,
}));

vi.mock("@/lib/users/architect-request-queries", () => ({
  countPendingArchitectRequests: pendingArchitectRequestsMock,
}));

vi.mock("@/lib/users/client-request-queries", () => ({
  countPendingClientRequests: pendingClientRequestsMock,
}));

vi.mock("@/lib/admin/admin-dashboard-metrics", () => ({
  countApprovedActiveClients: countClientsMock,
  countApprovedActiveArchitects: countArchitectsMock,
}));

vi.mock("@/lib/admin/buildAdminDashboardActivityFeed", () => ({
  buildAdminDashboardActivityFeed: activityFeedMock,
}));

vi.mock("@/lib/products/loadProductThumbnailMap", () => ({
  loadProductThumbnailMap: loadThumbnailsMock,
}));

describe("getAdminDashboardData", () => {
  beforeEach(() => {
    projectCountDocumentsMock.mockReset();
    projectAggregateMock.mockReset();
    productFindMock.mockReset();
    unreadCountMock.mockReset();
    quoteAttentionMock.mockReset();
    pendingArchitectRequestsMock.mockReset();
    pendingClientRequestsMock.mockReset();
    countClientsMock.mockReset();
    countArchitectsMock.mockReset();
    attentionCountMock.mockReset();
    activeCountMock.mockReset();
    activityFeedMock.mockReset();
    queueSummaryMock.mockReset();
    loadThumbnailsMock.mockReset();

    attentionCountMock.mockResolvedValue(7);
    activeCountMock.mockResolvedValue(12);
    projectCountDocumentsMock
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(18);
    unreadCountMock.mockResolvedValue(2);
    quoteAttentionMock.mockResolvedValue({
      quoteAcceptedAwaitingApprovalCount: 1,
      quoteChangeRequestedCount: 2,
      quoteAwaitingProfessionalCount: 3,
    });
    pendingArchitectRequestsMock.mockResolvedValue(2);
    pendingClientRequestsMock.mockResolvedValue(4);
    countClientsMock.mockResolvedValue(24);
    countArchitectsMock.mockResolvedValue(7);
    projectAggregateMock.mockResolvedValue([
      {
        _id: { toString: () => "507f1f77bcf86cd799439013" },
        name: "Project A",
        status: "submitted",
        updatedAt: new Date("2026-01-01T10:00:00.000Z"),
        location: "Tel Aviv",
        itemCount: 4,
      },
    ]);
    activityFeedMock.mockResolvedValue([
      {
        id: "project-updated-1",
        kind: "project_updated",
        primary: "פרויקט Project A עודכן",
        secondary: "Tel Aviv",
        timestamp: "2026-01-01T10:00:00.000Z",
        href: "/admin/projects/507f1f77bcf86cd799439013",
      },
    ]);
    queueSummaryMock.mockResolvedValue({
      all: 18,
      attention: 7,
      active: 12,
      commercial: 3,
      onboarding: 5,
    });
    productFindMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
              {
                _id: { toString: () => "507f1f77bcf86cd799439014" },
                nameHe: "Milano",
                sku: "MLN-01",
                updatedAt: new Date("2026-01-02T10:00:00.000Z"),
              },
            ]),
          }),
        }),
      }),
    });
    loadThumbnailsMock.mockResolvedValue({
      "507f1f77bcf86cd799439014": {
        url: "https://example.com/milano.jpg",
        altText: "Milano",
      },
    });
  });

  it("maps dashboard counts and extended dashboard payload", async () => {
    const { getAdminDashboardData } = await import(
      "@/lib/admin/getAdminDashboardData"
    );

    const data = await getAdminDashboardData("507f1f77bcf86cd799439011");

    expect(data.attentionProjectCount).toBe(7);
    expect(data.metrics.projects).toBe(18);
    expect(data.recentProjects).toEqual([
      {
        id: "507f1f77bcf86cd799439013",
        name: "Project A",
        status: "submitted",
        updatedAt: "2026-01-01T10:00:00.000Z",
        location: "Tel Aviv",
        itemCount: 4,
      },
    ]);
    expect(data.activityFeed).toHaveLength(1);
    expect(data.queueSummary).toEqual({
      all: 18,
      attention: 7,
      active: 12,
      commercial: 3,
      onboarding: 5,
    });
    expect(data.recentProducts).toEqual([
      {
        id: "507f1f77bcf86cd799439014",
        nameHe: "Milano",
        sku: "MLN-01",
        updatedAt: "2026-01-02T10:00:00.000Z",
      },
    ]);
    expect(data.productThumbnailsById["507f1f77bcf86cd799439014"]).toEqual({
      url: "https://example.com/milano.jpg",
      altText: "Milano",
    });
  });
});
