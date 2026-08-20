import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const findByIdMock = vi.fn();
const findOneMock = vi.fn();
const updateOneMock = vi.fn();
const upsertMock = vi.fn();
const restoreMock = vi.fn();
const deleteMock = vi.fn();
const getPreviousMock = vi.fn();
const applyApprovalMock = vi.fn();
const getRoomsMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    findById: findByIdMock,
    findOne: findOneMock,
    updateOne: updateOneMock,
  },
}));

vi.mock("@/lib/client-snapshots/client-approved-project-snapshot-repository", () => ({
  getClientApprovedProjectSnapshotDocument: getPreviousMock,
  upsertClientApprovedProjectSnapshot: upsertMock,
  restoreClientApprovedProjectSnapshot: restoreMock,
  deleteClientApprovedProjectSnapshot: deleteMock,
}));

vi.mock("@/lib/client-snapshots/buildApprovedClientProjectSnapshot", () => ({
  buildApprovedClientProjectSnapshot: vi.fn(() => ({
    projectId: "507f1f77bcf86cd799439013",
    submissionRevision: 2,
  })),
}));

vi.mock("@/lib/client-snapshots/resolveArchitectFullNameForSnapshot", () => ({
  resolveArchitectFullNameForSnapshot: vi.fn(async () => "Architect"),
}));

vi.mock("@/lib/products/loadProductThumbnailMap", () => ({
  loadProductThumbnailMap: vi.fn(async () => ({})),
}));

vi.mock("@/lib/projects/project-room-queries", () => ({
  getProjectRoomsForProject: getRoomsMock,
}));

describe("commercial approval restorative rollback", () => {
  const projectId = "507f1f77bcf86cd799439013";
  const layeredProject = {
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(),
    clientUserId: new Types.ObjectId(),
    onboardingStatus: "active",
    submissionRevision: 2,
    name: "Villa",
    items: [
      {
        _id: new Types.ObjectId(),
        productId: new Types.ObjectId(),
        roomId: new Types.ObjectId(),
        quantity: 1,
        snapshot: { productName: "Sofa", productSlug: "sofa" },
        pricing: {
          architectPriceAgorot: 100_000,
          clientPriceAgorot: 150_000,
          clientPriceStale: false,
          priceVersion: 1,
        },
      },
    ],
  };

  beforeEach(() => {
    findByIdMock.mockReset();
    getPreviousMock.mockReset();
    upsertMock.mockReset();
    restoreMock.mockReset();
    deleteMock.mockReset();
    getRoomsMock.mockReset();
    applyApprovalMock.mockReset();

    findByIdMock.mockResolvedValue(layeredProject);
    getRoomsMock.mockResolvedValue([
      { _id: layeredProject.items[0].roomId, name: "Room", order: 0 },
    ]);
    upsertMock.mockResolvedValue(undefined);
    getPreviousMock.mockResolvedValue(null);
  });

  it("deletes new snapshot when first approval fails", async () => {
    applyApprovalMock.mockRejectedValue(new Error("approval failed"));

    const { approveLayeredProjectWithClientSnapshot } = await import(
      "@/lib/client-snapshots/commercial-approval-with-snapshot"
    );

    await expect(
      approveLayeredProjectWithClientSnapshot(
        "admin",
        projectId,
        applyApprovalMock,
      ),
    ).rejects.toThrow("approval failed");

    expect(deleteMock).toHaveBeenCalledWith(projectId);
    expect(restoreMock).not.toHaveBeenCalled();
  });

  it("restores previous snapshot when re-approval fails", async () => {
    const previousSnapshot = {
      _id: new Types.ObjectId(),
      projectId: new Types.ObjectId(projectId),
      submissionRevision: 1,
      rooms: [],
    };

    getPreviousMock.mockResolvedValue(previousSnapshot);
    applyApprovalMock.mockRejectedValue(new Error("approval failed"));

    const { approveLayeredProjectWithClientSnapshot } = await import(
      "@/lib/client-snapshots/commercial-approval-with-snapshot"
    );

    await expect(
      approveLayeredProjectWithClientSnapshot(
        "admin",
        projectId,
        applyApprovalMock,
      ),
    ).rejects.toThrow("approval failed");

    expect(restoreMock).toHaveBeenCalledWith(previousSnapshot);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("keeps new snapshot when approval succeeds", async () => {
    applyApprovalMock.mockResolvedValue(undefined);

    const { approveLayeredProjectWithClientSnapshot } = await import(
      "@/lib/client-snapshots/commercial-approval-with-snapshot"
    );

    await approveLayeredProjectWithClientSnapshot(
      "admin",
      projectId,
      applyApprovalMock,
    );

    expect(upsertMock).toHaveBeenCalled();
    expect(restoreMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
