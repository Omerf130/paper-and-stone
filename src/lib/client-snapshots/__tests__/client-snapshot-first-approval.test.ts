import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { Types } from "mongoose";
import Project from "@/models/Project";

const {
  getPreviousMock,
  upsertMock,
  deleteMock,
  restoreMock,
  getRoomsMock,
  applyApprovalMock,
  resolveArchitectMock,
  loadThumbnailsMock,
} = vi.hoisted(() => ({
  getPreviousMock: vi.fn(),
  upsertMock: vi.fn(),
  deleteMock: vi.fn(),
  restoreMock: vi.fn(),
  getRoomsMock: vi.fn(),
  applyApprovalMock: vi.fn(),
  resolveArchitectMock: vi.fn(),
  loadThumbnailsMock: vi.fn(),
}));

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/lib/client-snapshots/client-approved-project-snapshot-repository", () => ({
  getClientApprovedProjectSnapshotDocument: getPreviousMock,
  upsertClientApprovedProjectSnapshot: upsertMock,
  restoreClientApprovedProjectSnapshot: restoreMock,
  deleteClientApprovedProjectSnapshot: deleteMock,
}));

vi.mock("@/lib/client-snapshots/resolveArchitectFullNameForSnapshot", () => ({
  resolveArchitectFullNameForSnapshot: resolveArchitectMock,
}));

vi.mock("@/lib/products/loadProductThumbnailMap", () => ({
  loadProductThumbnailMap: loadThumbnailsMock,
}));

vi.mock("@/lib/projects/project-room-queries", () => ({
  getProjectRoomsForProject: getRoomsMock,
}));

function createHydratedLayeredProject(projectId: string) {
  const roomId = new Types.ObjectId();
  const productId = new Types.ObjectId();
  const itemId = new Types.ObjectId();

  const project = new Project({
    _id: new Types.ObjectId(projectId),
    ownerUserId: new Types.ObjectId(),
    clientUserId: new Types.ObjectId(),
    name: "Villa",
    onboardingStatus: "active",
    status: "submitted",
    submissionRevision: 1,
    items: [
      {
        _id: itemId,
        productId,
        roomId,
        selectedMaterialId: null,
        selectedColorId: null,
        selectedSizeKey: null,
        quantity: 1,
        snapshot: {
          productName: "ספת Milano",
          productSlug: "milano-sofa",
          sku: "PS-MIL-001",
        },
        pricing: {
          priceVersion: 1,
          clientPriceAgorot: 180_000,
          architectPriceAgorot: 120_000,
          clientPriceStale: false,
        },
      },
    ],
  });

  return { project, roomId, productId, itemId };
}

describe("first commercial approval snapshot", () => {
  const projectId = "507f1f77bcf86cd799439013";

  beforeEach(() => {
    getPreviousMock.mockReset();
    upsertMock.mockReset();
    deleteMock.mockReset();
    restoreMock.mockReset();
    getRoomsMock.mockReset();
    applyApprovalMock.mockReset();
    resolveArchitectMock.mockReset();
    loadThumbnailsMock.mockReset();

    getPreviousMock.mockResolvedValue(null);
    upsertMock.mockResolvedValue(undefined);
    resolveArchitectMock.mockResolvedValue("Dana Levi");
    loadThumbnailsMock.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates client snapshot from hydrated mongoose project items", async () => {
    const { project, roomId, itemId } = createHydratedLayeredProject(projectId);

    getRoomsMock.mockResolvedValue([
      { _id: roomId, name: "Living", order: 0 },
    ]);

    const { createClientSnapshotForCommercialApproval } = await import(
      "@/lib/client-snapshots/commercial-approval-with-snapshot"
    );

    await createClientSnapshotForCommercialApproval(project);

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId,
        submissionRevision: 1,
        architect: { fullName: "Dana Levi" },
        rooms: [
          expect.objectContaining({
            name: "Living",
            items: [
              expect.objectContaining({
                projectItemId: itemId.toString(),
                productCode: "PS-MIL-001",
                clientUnitPriceAgorot: 180_000,
                clientLineTotalAgorot: 180_000,
              }),
            ],
            clientRoomTotalAgorot: 180_000,
          }),
        ],
        clientProjectTotalAgorot: 180_000,
      }),
    );
  });

  it("approves layered project on first approval with no existing snapshot", async () => {
    const { project, roomId, itemId } = createHydratedLayeredProject(projectId);

    vi.spyOn(Project, "findById").mockResolvedValue(project as never);
    getRoomsMock.mockResolvedValue([
      { _id: roomId, name: "Living", order: 0 },
    ]);
    applyApprovalMock.mockResolvedValue(undefined);

    const { approveLayeredProjectWithClientSnapshot } = await import(
      "@/lib/client-snapshots/commercial-approval-with-snapshot"
    );

    await approveLayeredProjectWithClientSnapshot(
      "507f1f77bcf86cd799439011",
      projectId,
      applyApprovalMock,
    );

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId,
        rooms: [
          expect.objectContaining({
            items: [
              expect.objectContaining({
                projectItemId: itemId.toString(),
              }),
            ],
          }),
        ],
      }),
    );
    expect(applyApprovalMock).toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
    expect(restoreMock).not.toHaveBeenCalled();
  });

  it("approves first layered project when thumbnail has url but no alt", async () => {
    const { project, roomId, productId, itemId } =
      createHydratedLayeredProject(projectId);

    vi.spyOn(Project, "findById").mockResolvedValue(project as never);
    getRoomsMock.mockResolvedValue([
      { _id: roomId, name: "Living", order: 0 },
    ]);
    loadThumbnailsMock.mockResolvedValue({
      [productId.toString()]: {
        url: "https://cdn.example/milano-sofa.jpg",
        altText: "",
      },
    });
    applyApprovalMock.mockResolvedValue(undefined);

    const { approveLayeredProjectWithClientSnapshot } = await import(
      "@/lib/client-snapshots/commercial-approval-with-snapshot"
    );

    await approveLayeredProjectWithClientSnapshot(
      "507f1f77bcf86cd799439011",
      projectId,
      applyApprovalMock,
    );

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId,
        rooms: [
          expect.objectContaining({
            items: [
              expect.objectContaining({
                projectItemId: itemId.toString(),
                image: {
                  url: "https://cdn.example/milano-sofa.jpg",
                  alt: "ספת Milano",
                },
              }),
            ],
          }),
        ],
      }),
    );
    expect(applyApprovalMock).toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
