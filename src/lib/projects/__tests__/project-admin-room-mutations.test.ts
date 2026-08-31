import { describe, expect, it, vi, beforeEach } from "vitest";

const updateOneMock = vi.fn();
const deleteOneMock = vi.fn();
const findOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    updateOne: updateOneMock,
    findOne: findOneMock,
  },
}));

vi.mock("@/models/ProjectRoom", () => ({
  default: {
    deleteOne: deleteOneMock,
  },
}));

vi.mock("@/lib/projects/project-room-queries", () => ({
  findProjectRoomForProject: vi.fn(async () => ({ _id: "room-1" })),
  getProjectRoomsForProject: vi.fn(async () => []),
  getNextProjectRoomOrder: vi.fn(async () => 0),
}));

vi.mock("@/lib/projects/project-commercial-dirty", () => ({
  markProjectCommercialDirtyIfNeeded: vi.fn(async () => undefined),
  appendCommercialDirtyToSet: vi.fn((project, $set) => {
    if (project.status === "approved") {
      $set.commercialDirty = true;
    }
  }),
}));

describe("project-admin-room-mutations", () => {
  const activeProject = {
    onboardingStatus: "active" as const,
    status: "approved" as const,
    commercialDirty: false,
    items: [],
  };

  beforeEach(() => {
    updateOneMock.mockReset();
    deleteOneMock.mockReset();
    findOneMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
    deleteOneMock.mockResolvedValue({ deletedCount: 1 });
    findOneMock.mockResolvedValue(activeProject);
  });

  it("moves item to orphan section when target room is empty", async () => {
    const { moveProjectItemToRoomAsAdmin } = await import(
      "@/lib/projects/project-admin-room-mutations"
    );

    await moveProjectItemToRoomAsAdmin(
      "507f1f77bcf86cd799439013",
      "507f1f77bcf86cd799439014",
      "",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        "items._id": expect.anything(),
      }),
      {
        $set: expect.objectContaining({
          "items.$.roomId": null,
        }),
      },
    );
  });

  it("moves item to selected room", async () => {
    const { moveProjectItemToRoomAsAdmin } = await import(
      "@/lib/projects/project-admin-room-mutations"
    );

    await moveProjectItemToRoomAsAdmin(
      "507f1f77bcf86cd799439013",
      "507f1f77bcf86cd799439014",
      "507f1f77bcf86cd799439099",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: expect.objectContaining({
          "items.$.roomId": expect.anything(),
        }),
      },
    );
  });

  it("blocks room deletion when room has items", async () => {
    findOneMock.mockResolvedValue({
      ...activeProject,
      items: [{ roomId: { toString: () => "507f1f77bcf86cd799439099" } }],
    });

    const { deleteProjectRoomAsAdmin } = await import(
      "@/lib/projects/project-admin-room-mutations"
    );

    await expect(
      deleteProjectRoomAsAdmin(
        "507f1f77bcf86cd799439013",
        "507f1f77bcf86cd799439099",
      ),
    ).rejects.toMatchObject({
      message: expect.stringContaining("מוצרים"),
    });

    expect(deleteOneMock).not.toHaveBeenCalled();
  });
});
