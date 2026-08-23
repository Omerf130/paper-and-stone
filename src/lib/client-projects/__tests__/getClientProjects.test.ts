import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const projectFindMock = vi.fn();
const snapshotFindMock = vi.fn();
const snapshotFindOneMock = vi.fn();
const countDocumentsMock = vi.fn();
const projectFindOneMock = vi.fn();
const projectFindByIdMock = vi.fn();
const userFindMock = vi.fn();
const profileFindMock = vi.fn();
const messageAggregateMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/ProjectMessage", () => ({
  default: {
    aggregate: messageAggregateMock,
  },
}));

vi.mock("@/models/Project", () => ({
  default: {
    find: projectFindMock,
    findOne: projectFindOneMock,
    findById: projectFindByIdMock,
    countDocuments: countDocumentsMock,
  },
}));

vi.mock("@/models/ClientApprovedProjectSnapshot", () => ({
  default: {
    find: snapshotFindMock,
    findOne: snapshotFindOneMock,
  },
}));

vi.mock("@/models/User", () => ({
  default: {
    find: userFindMock,
    findById: vi.fn(),
  },
}));

vi.mock("@/models/ProfessionalProfile", () => ({
  default: {
    find: profileFindMock,
  },
}));

const clientId = "507f1f77bcf86cd799439011";
const otherClientId = "507f1f77bcf86cd799439012";
const projectId = "507f1f77bcf86cd799439013";
const architectId = "507f1f77bcf86cd799439014";

function mockAssignedProject(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(projectId),
    name: "Villa",
    ownerUserId: new Types.ObjectId(architectId),
    status: "draft",
    commercialDirty: false,
    submissionRevision: 0,
    updatedAt: new Date("2026-01-02"),
    ...overrides,
  };
}

function buildSnapshot(submissionRevision = 1) {
  return {
    _id: new Types.ObjectId(),
    schemaVersion: 1,
    projectId: new Types.ObjectId(projectId),
    clientUserId: new Types.ObjectId(clientId),
    architectUserId: new Types.ObjectId(architectId),
    projectName: "Villa",
    submissionRevision,
    approvedAt: new Date("2026-01-01"),
    architect: { fullName: "Architect One" },
    rooms: [
      {
        roomId: new Types.ObjectId(),
        name: "סלון",
        order: 0,
        clientRoomTotalAgorot: 100000,
        items: [
          {
            projectItemId: new Types.ObjectId(),
            productName: "Chair",
            productCode: "CH-1",
            configuration: { material: "עץ" },
            quantity: 2,
            clientUnitPriceAgorot: 50000,
            clientLineTotalAgorot: 100000,
          },
        ],
      },
    ],
    clientProjectTotalAgorot: 100000,
  };
}

function mockArchitectLookup() {
  userFindMock.mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        {
          _id: new Types.ObjectId(architectId),
          fullName: "Architect One",
          email: "arch@example.com",
        },
      ]),
    }),
  });

  profileFindMock.mockReturnValue({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    }),
  });
}


vi.mock("@/lib/project-items/get-project-item-workflow-settings", () => ({
  getProjectItemWorkflowSettings: vi.fn().mockResolvedValue({
    transitions: [
      {
        from: "client_review",
        to: "client_approved",
        allowedRoles: ["client"],
      },
    ],
  }),
}));

describe("client project queries", () => {
  beforeEach(() => {
    projectFindMock.mockReset();
    snapshotFindMock.mockReset();
    snapshotFindOneMock.mockReset();
    countDocumentsMock.mockReset();
    projectFindOneMock.mockReset();
    projectFindByIdMock.mockReset();
    userFindMock.mockReset();
    profileFindMock.mockReset();
    messageAggregateMock.mockReset();
    messageAggregateMock.mockResolvedValue([]);
  });

  it("shows assigned project before onboarding is active with no snapshot", async () => {
    const project = mockAssignedProject({ status: "draft" });

    projectFindMock.mockImplementation(() => {
      const leanResult = vi.fn().mockResolvedValue([project]);
      const limitChain = { lean: leanResult };
      const skipChain = {
        limit: vi.fn().mockReturnValue(limitChain),
        lean: leanResult,
      };
      const sortChain = {
        skip: vi.fn().mockReturnValue(skipChain),
        limit: vi.fn().mockReturnValue(limitChain),
        lean: leanResult,
      };

      return {
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue(sortChain),
        }),
      };
    });

    countDocumentsMock.mockResolvedValue(1);
    snapshotFindMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    });
    mockArchitectLookup();

    const { getClientProjectsPage } = await import(
      "@/lib/client-projects/getClientProjectsPage"
    );

    const result = await getClientProjectsPage(clientId, {
      query: null,
      page: 1,
    });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]?.presentationState.label).toBe("בתהליך עבודה");
    expect(result.projects[0]?.roomCount).toBeUndefined();
    expect(result.projects[0]?.productCount).toBeUndefined();
    expect(result.projects[0]?.clientProjectTotalAgorot).toBeUndefined();
  });

  it("returns informational detail without rooms or products when no snapshot", async () => {
    const project = mockAssignedProject({ status: "draft" });

    projectFindOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(project),
      }),
    });

    projectFindByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          clientUserId: new Types.ObjectId(clientId),
        }),
      }),
    });

    snapshotFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    mockArchitectLookup();

    const { getClientProjectDetail } = await import(
      "@/lib/client-projects/getClientProjectDetail"
    );

    const detail = await getClientProjectDetail(clientId, projectId);

    expect(detail?.kind).toBe("no-snapshot");
    if (detail?.kind === "no-snapshot") {
      expect(detail.presentationState.label).toBe("בתהליך עבודה");
    }
  });

  it("denies access when project belongs to another client", async () => {
    projectFindOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      }),
    });

    const { getClientProjectDetail } = await import(
      "@/lib/client-projects/getClientProjectDetail"
    );

    const detail = await getClientProjectDetail(otherClientId, projectId);
    expect(detail).toBeNull();
  });

  it("shows approved snapshot content and updating state when dirty", async () => {
    const project = mockAssignedProject({
      status: "approved",
      commercialDirty: true,
      submissionRevision: 1,
    });

    projectFindOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(project),
      }),
    });

    projectFindByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          clientUserId: new Types.ObjectId(clientId),
        }),
      }),
    });

    snapshotFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(buildSnapshot(1)),
    });

    const snapshot = buildSnapshot(1);
    const snapshotItemId = snapshot.rooms[0]?.items[0]?.projectItemId;

    projectFindOneMock
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(project),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          items: [
            {
              _id: snapshotItemId,
              status: "client_approved",
            },
          ],
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          items: [
            {
              _id: snapshotItemId,
              status: "client_approved",
            },
          ],
        }),
      });

    const { getClientProjectDetail } = await import(
      "@/lib/client-projects/getClientProjectDetail"
    );

    const detail = await getClientProjectDetail(clientId, projectId);

    expect(detail?.kind).toBe("approved");
    if (detail?.kind === "approved") {
      expect(detail.presentationState.label).toBe("הפרויקט מתעדכן");
      expect(detail.snapshot.rooms).toHaveLength(1);
      expect(detail.snapshot.rooms[0]?.items[0]?.productName).toBe("Chair");
      expect(detail.roomCount).toBe(1);
      expect(detail.productCount).toBe(1);
      expect(detail.workflowByItemId).toBeDefined();
      expect(detail.pendingReviewCount).toBe(0);
    }
  });

  it("returns snapshot-unavailable when approved project has no snapshot", async () => {
    const project = mockAssignedProject({
      status: "approved",
      submissionRevision: 1,
    });

    projectFindOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(project),
      }),
    });

    projectFindByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          clientUserId: new Types.ObjectId(clientId),
        }),
      }),
    });

    snapshotFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    mockArchitectLookup();

    const { getClientProjectDetail } = await import(
      "@/lib/client-projects/getClientProjectDetail"
    );

    const detail = await getClientProjectDetail(clientId, projectId);
    expect(detail?.kind).toBe("snapshot-unavailable");
  });
});
