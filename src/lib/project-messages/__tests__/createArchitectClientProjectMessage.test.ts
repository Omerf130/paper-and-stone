import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

const createMock = vi.fn();
const findByIdProjectMock = vi.fn();
const findOneProjectMock = vi.fn();
const findByIdUserMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/ProjectMessage", () => ({
  default: {
    create: createMock,
  },
}));

vi.mock("@/models/Project", () => ({
  default: {
    findById: findByIdProjectMock,
    findOne: findOneProjectMock,
  },
}));

vi.mock("@/models/User", () => ({
  default: {
    findById: findByIdUserMock,
  },
}));

const projectId = "507f1f77bcf86cd799439013";
const architectId = "507f1f77bcf86cd799439012";
const clientId = "507f1f77bcf86cd799439014";
const messageId = "507f1f77bcf86cd799439015";

describe("createArchitectClientProjectMessage", () => {
  beforeEach(() => {
    createMock.mockReset();
    findByIdProjectMock.mockReset();
    findOneProjectMock.mockReset();
    findByIdUserMock.mockReset();

    createMock.mockResolvedValue({
      _id: new Types.ObjectId(messageId),
    });
  });

  it("creates architect message scoped to assigned client", async () => {
    findByIdProjectMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: new Types.ObjectId(projectId),
        ownerUserId: new Types.ObjectId(architectId),
        clientUserId: new Types.ObjectId(clientId),
        name: "Villa",
      }),
    });
    findByIdUserMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        isActive: true,
        role: "client",
      }),
    });

    const { createArchitectClientProjectMessage } = await import(
      "@/lib/project-messages/createArchitectClientProjectMessage"
    );

    await createArchitectClientProjectMessage(architectId, projectId, "שלום");

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationType: "architect_client",
        senderRole: "architect",
        audience: "client",
        clientUserIdAtSend: new Types.ObjectId(clientId),
        body: "שלום",
        readByUserIds: [new Types.ObjectId(architectId)],
      }),
    );
  });

  it("rejects architect send when assigned client is inactive", async () => {
    findByIdProjectMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: new Types.ObjectId(projectId),
        ownerUserId: new Types.ObjectId(architectId),
        clientUserId: new Types.ObjectId(clientId),
        name: "Villa",
      }),
    });
    findByIdUserMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        isActive: false,
        role: "client",
      }),
    });

    const { createArchitectClientProjectMessage } = await import(
      "@/lib/project-messages/createArchitectClientProjectMessage"
    );

    await expect(
      createArchitectClientProjectMessage(architectId, projectId, "שלום"),
    ).rejects.toMatchObject({ message: expect.any(String) });
    expect(createMock).not.toHaveBeenCalled();
  });
});

describe("createClientArchitectProjectMessage", () => {
  beforeEach(() => {
    createMock.mockReset();
    findOneProjectMock.mockReset();

    createMock.mockResolvedValue({
      _id: new Types.ObjectId(messageId),
    });
  });

  it("creates client message for assigned project only", async () => {
    findOneProjectMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: new Types.ObjectId(projectId),
        ownerUserId: new Types.ObjectId(architectId),
        clientUserId: new Types.ObjectId(clientId),
        name: "Villa",
      }),
    });

    const { createClientArchitectProjectMessage } = await import(
      "@/lib/project-messages/createArchitectClientProjectMessage"
    );

    await createClientArchitectProjectMessage(clientId, projectId, "שאלה");

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationType: "architect_client",
        senderRole: "client",
        audience: "architect",
        clientUserIdAtSend: new Types.ObjectId(clientId),
        body: "שאלה",
        readByUserIds: [new Types.ObjectId(clientId)],
      }),
    );
  });
});
