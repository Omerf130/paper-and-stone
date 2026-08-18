import { describe, expect, it, vi, beforeEach } from "vitest";

const createMock = vi.fn();
const updateOneMock = vi.fn();
const deleteOneMock = vi.fn();
const findOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    create: createMock,
    updateOne: updateOneMock,
    deleteOne: deleteOneMock,
    findOne: findOneMock,
  },
}));

vi.mock("@/lib/professionals/ensureProfessionalProfile", () => ({
  getMyProfessionalProfileView: vi.fn(async () => ({
    fullName: "דנה לוי",
    phone: "050-1234567",
  })),
}));

vi.mock("@/lib/projects/verifyProjectItemSelection", () => ({
  verifyProjectItemSelectionForAdd: vi.fn(async () => ({
    productId: "507f1f77bcf86cd799439012",
    productView: {
      slug: "milano-sofa",
      nameHe: "Milano",
      sku: "SKU-1",
      materialOptions: [],
      sizes: [],
    },
    selectedMaterialId: null,
    selectedColorId: null,
    selectedSizeKey: null,
  })),
  verifyProjectItemSelectionForEdit: vi.fn(),
}));

vi.mock("@/lib/projects/buildProjectItemSnapshot", () => ({
  buildProjectItemSnapshot: vi.fn(() => ({
    productName: "Milano",
    productSlug: "milano-sofa",
    sku: "SKU-1",
  })),
}));

vi.mock("@/lib/projects/project-room-mutations", () => ({
  verifyRoomBelongsToProject: vi.fn(async () => undefined),
}));

describe("project-mutations", () => {
  const draftProject = { _id: { toString: () => "project-1" }, status: "draft", items: [] };
  const roomBasedProject = {
    ...draftProject,
    onboardingStatus: "active" as const,
  };

  beforeEach(() => {
    createMock.mockReset();
    updateOneMock.mockReset();
    deleteOneMock.mockReset();
    findOneMock.mockReset();
    updateOneMock.mockResolvedValue({ modifiedCount: 0, matchedCount: 1 });
    findOneMock.mockResolvedValue(draftProject);
    createMock.mockResolvedValue({ _id: { toString: () => "project-1" } });
  });

  it("creates project with owner from session and draft status", async () => {
    const { createProject } = await import("@/lib/projects/project-mutations");

    const projectId = await createProject("507f1f77bcf86cd799439011", {
      name: "פרויקט חדש",
    });

    expect(projectId).toBe("project-1");
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: expect.anything(),
        name: "פרויקט חדש",
        status: "draft",
        onboardingStatus: "pending_approval",
        clientUserId: null,
        items: [],
      }),
    );
  });

  it("increments duplicate item quantity atomically when under max", async () => {
    updateOneMock.mockResolvedValueOnce({ modifiedCount: 1, matchedCount: 1 });

    const { addProductToProject } = await import("@/lib/projects/project-mutations");

    await addProductToProject(
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439013",
      "milano-sofa",
      2,
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: expect.anything(),
        ownerUserId: expect.anything(),
        status: { $in: ["draft", "changes_requested"] },
      }),
      { $inc: { "items.$.quantity": 2 } },
    );
  });

  it("rejects duplicate increment when combined quantity would exceed 999", async () => {
    updateOneMock.mockResolvedValue({ modifiedCount: 0, matchedCount: 0 });

    findOneMock
      .mockResolvedValueOnce(draftProject)
      .mockResolvedValueOnce({
        items: [
          {
            _id: { toString: () => "item-1" },
            productId: { toString: () => "507f1f77bcf86cd799439012" },
            selectedMaterialId: null,
            selectedColorId: null,
            selectedSizeKey: null,
            quantity: 990,
          },
        ],
      });

    const { addProductToProject } = await import("@/lib/projects/project-mutations");
    const { PROJECT_ERRORS } = await import("@/lib/projects/project-validation");

    await expect(
      addProductToProject(
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439013",
        "milano-sofa",
        20,
      ),
    ).rejects.toMatchObject({
      message: PROJECT_ERRORS.QUANTITY_EXCEEDS_MAX,
    });
  });

  it("pushes new item when no matching configuration exists", async () => {
    updateOneMock
      .mockResolvedValueOnce({ modifiedCount: 0, matchedCount: 0 })
      .mockResolvedValueOnce({ modifiedCount: 1, matchedCount: 1 });

    findOneMock
      .mockResolvedValueOnce(draftProject)
      .mockResolvedValueOnce({ items: [] });

    const { addProductToProject } = await import("@/lib/projects/project-mutations");

    await addProductToProject(
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439013",
      "milano-sofa",
      1,
    );

    expect(updateOneMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: { $in: ["draft", "changes_requested"] },
      }),
      expect.objectContaining({
        $push: expect.objectContaining({
          items: expect.objectContaining({
            quantity: 1,
          }),
        }),
      }),
    );
  });

  it("requires roomId when adding to room-based projects", async () => {
    findOneMock.mockResolvedValueOnce(roomBasedProject);

    const { addProductToProject } = await import("@/lib/projects/project-mutations");
    const { PROJECT_ROOM_ERRORS } = await import("@/types/project-room");

    await expect(
      addProductToProject(
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439013",
        "milano-sofa",
        1,
      ),
    ).rejects.toMatchObject({
      message: PROJECT_ROOM_ERRORS.ROOM_REQUIRED,
    });
  });
});
