import { describe, expect, it, vi, beforeEach } from "vitest";

const projectCountDocumentsMock = vi.fn();
const projectFindMock = vi.fn();
const unreadCountMock = vi.fn();
const pendingArchitectRequestsMock = vi.fn();
const pendingClientRequestsMock = vi.fn();
const countClientsMock = vi.fn();
const countArchitectsMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    countDocuments: projectCountDocumentsMock,
    find: projectFindMock,
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

describe("getAdminDashboardData", () => {
  beforeEach(() => {
    projectCountDocumentsMock.mockReset();
    projectFindMock.mockReset();
    unreadCountMock.mockReset();
    quoteAttentionMock.mockReset();
    pendingArchitectRequestsMock.mockReset();
    pendingClientRequestsMock.mockReset();
    countClientsMock.mockReset();
    countArchitectsMock.mockReset();
    attentionCountMock.mockReset();
    activeCountMock.mockReset();

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

    expect(data.attentionProjectCount).toBe(7);
    expect(data.activeProjectCount).toBe(12);
    expect(data.submittedProjectCount).toBe(3);
    expect(data.pendingOnboardingProjectCount).toBe(5);
    expect(data.unreadAdminMessageCount).toBe(2);
    expect(data.quoteAcceptedAwaitingApprovalCount).toBe(1);
    expect(data.quoteChangeRequestedCount).toBe(2);
    expect(data.quoteAwaitingArchitectCount).toBe(3);
    expect(data.pendingArchitectRequestCount).toBe(2);
    expect(data.pendingClientRequestCount).toBe(4);
    expect(data.metrics).toEqual({
      clients: 24,
      architects: 7,
      projects: 18,
      activeProjects: 12,
      attentionProjects: 7,
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
