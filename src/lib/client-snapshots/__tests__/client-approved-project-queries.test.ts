import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const findMock = vi.fn();
const findOneMock = vi.fn();
const projectFindByIdMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/ClientApprovedProjectSnapshot", () => ({
  default: {
    find: findMock,
    findOne: findOneMock,
  },
}));

vi.mock("@/models/Project", () => ({
  default: {
    findById: projectFindByIdMock,
  },
}));

describe("client approved project queries", () => {
  beforeEach(() => {
    findMock.mockReset();
    findOneMock.mockReset();
    projectFindByIdMock.mockReset();
  });

  it("returns snapshot only for assigned client", async () => {
    const clientId = "507f1f77bcf86cd799439011";
    const projectId = "507f1f77bcf86cd799439013";

    findOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        schemaVersion: 1,
        projectId: new Types.ObjectId(projectId),
        clientUserId: new Types.ObjectId(clientId),
        architectUserId: new Types.ObjectId(),
        projectName: "Villa",
        submissionRevision: 1,
        approvedAt: new Date("2026-01-01"),
        architect: { fullName: "Architect" },
        rooms: [],
        clientProjectTotalAgorot: 0,
      }),
    });

    projectFindByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          clientUserId: new Types.ObjectId(clientId),
        }),
      }),
    });

    const { getClientApprovedProjectSnapshotByProjectId } = await import(
      "@/lib/client-snapshots/getClientApprovedProjectSnapshots"
    );

    const view = await getClientApprovedProjectSnapshotByProjectId(
      clientId,
      projectId,
    );

    expect(view?.projectId).toBe(projectId);
  });

  it("returns null when project reassigned to another client", async () => {
    const clientId = "507f1f77bcf86cd799439011";
    const projectId = "507f1f77bcf86cd799439013";

    projectFindByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          clientUserId: new Types.ObjectId("507f1f77bcf86cd799439099"),
        }),
      }),
    });

    const { getClientApprovedProjectSnapshotByProjectId } = await import(
      "@/lib/client-snapshots/getClientApprovedProjectSnapshots"
    );

    const view = await getClientApprovedProjectSnapshotByProjectId(
      clientId,
      projectId,
    );

    expect(view).toBeNull();
  });

  it("batch loads snapshots by project ids", async () => {
    const clientId = "507f1f77bcf86cd799439011";
    const projectId = "507f1f77bcf86cd799439013";

    findMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        {
          _id: new Types.ObjectId(),
          schemaVersion: 1,
          projectId: new Types.ObjectId(projectId),
          clientUserId: new Types.ObjectId(clientId),
          architectUserId: new Types.ObjectId(),
          projectName: "Villa",
          submissionRevision: 1,
          approvedAt: new Date("2026-01-01"),
          architect: { fullName: "Architect" },
          rooms: [],
          clientProjectTotalAgorot: 0,
        },
      ]),
    });

    const { getClientApprovedProjectSnapshotsByProjectIds } = await import(
      "@/lib/client-snapshots/getClientApprovedProjectSnapshots"
    );

    const map = await getClientApprovedProjectSnapshotsByProjectIds(clientId, [
      projectId,
    ]);

    expect(map.get(projectId)?.projectName).toBe("Villa");
  });
});
