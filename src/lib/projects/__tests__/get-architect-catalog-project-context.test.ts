import { describe, expect, it, vi, beforeEach } from "vitest";

const findOneProjectMock = vi.fn();
const findRoomMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/User", () => ({ default: {} }));

vi.mock("@/models/Project", () => ({
  default: {
    findOne: findOneProjectMock,
  },
}));

vi.mock("@/lib/projects/project-room-queries", () => ({
  findProjectRoomForProject: findRoomMock,
}));

describe("getArchitectCatalogProjectContext", () => {
  beforeEach(() => {
    findOneProjectMock.mockReset();
    findRoomMock.mockReset();
    findOneProjectMock.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });
  });

  it("returns null for invalid ids", async () => {
    const { getArchitectCatalogProjectContext } = await import(
      "@/lib/projects/get-architect-catalog-project-context"
    );

    await expect(
      getArchitectCatalogProjectContext("architect-1", {
        projectId: "bad",
        roomId: "507f1f77bcf86cd799439012",
      }),
    ).resolves.toBeNull();
  });

  it("returns context for owned editable project and room", async () => {
    findOneProjectMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        name: "בית משפחת כהן",
        status: "approved",
        onboardingStatus: "active",
      }),
    });
    findRoomMock.mockResolvedValue({
      _id: { toString: () => "507f1f77bcf86cd799439012" },
      name: "סלון",
    });

    const { getArchitectCatalogProjectContext } = await import(
      "@/lib/projects/get-architect-catalog-project-context"
    );

    const context = await getArchitectCatalogProjectContext(
      "507f1f77bcf86cd799439099",
      {
      projectId: "507f1f77bcf86cd799439011",
      roomId: "507f1f77bcf86cd799439012",
      },
    );

    expect(context).toEqual({
      projectId: "507f1f77bcf86cd799439011",
      projectName: "בית משפחת כהן",
      roomId: "507f1f77bcf86cd799439012",
      roomName: "סלון",
      returnHref:
        "/professional/projects/507f1f77bcf86cd799439011?room=507f1f77bcf86cd799439012",
    });
  });

  it("returns null when project is not editable", async () => {
    findOneProjectMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        name: "פרויקט נעול",
        status: "submitted",
        onboardingStatus: "active",
      }),
    });

    const { getArchitectCatalogProjectContext } = await import(
      "@/lib/projects/get-architect-catalog-project-context"
    );

    await expect(
      getArchitectCatalogProjectContext("507f1f77bcf86cd799439099", {
        projectId: "507f1f77bcf86cd799439011",
        roomId: "507f1f77bcf86cd799439012",
      }),
    ).resolves.toBeNull();
  });
});
