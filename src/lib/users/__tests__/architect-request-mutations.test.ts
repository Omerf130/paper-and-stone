import { describe, expect, it, vi, beforeEach } from "vitest";

const findByIdMock = vi.fn();
const updateOneMock = vi.fn();
const ensureProfessionalProfileMock = vi.fn();
const profileUpdateOneMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  default: {
    findById: findByIdMock,
    updateOne: updateOneMock,
  },
}));

vi.mock("@/models/ProfessionalProfile", () => ({
  default: {
    updateOne: profileUpdateOneMock,
  },
}));

vi.mock("@/lib/professionals/ensureProfessionalProfile", () => ({
  ensureProfessionalProfile: ensureProfessionalProfileMock,
}));

describe("architect-request-mutations", () => {
  beforeEach(() => {
    findByIdMock.mockReset();
    updateOneMock.mockReset();
    ensureProfessionalProfileMock.mockReset();
    profileUpdateOneMock.mockReset();
    updateOneMock.mockResolvedValue({ matchedCount: 1 });
    ensureProfessionalProfileMock.mockResolvedValue({});
    profileUpdateOneMock.mockResolvedValue({});
  });

  it("approves architect request and clears requestedRole", async () => {
    findByIdMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      role: "client",
      requestedRole: "architect",
      isActive: true,
      fullName: "אדריכלית לדוגמה",
    });

    const { approveArchitectRequest } = await import(
      "@/lib/users/architect-request-mutations"
    );

    await approveArchitectRequest(
      { id: "admin-1", email: "admin@example.com", role: "admin" },
      "507f1f77bcf86cd799439011",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: "507f1f77bcf86cd799439011" },
      { $set: { role: "architect", requestedRole: null } },
    );
    expect(ensureProfessionalProfileMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
    );
  });

  it("declines architect request while keeping client role", async () => {
    findByIdMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      role: "client",
      requestedRole: "architect",
      isActive: true,
    });

    const { declineArchitectRequest } = await import(
      "@/lib/users/architect-request-mutations"
    );

    await declineArchitectRequest(
      { id: "admin-1", email: "admin@example.com", role: "admin" },
      "507f1f77bcf86cd799439011",
    );

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: "507f1f77bcf86cd799439011" },
      { $set: { requestedRole: null, role: "client" } },
    );
  });

  it("rejects approval when user is not pending architect request", async () => {
    findByIdMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      role: "client",
      requestedRole: null,
      isActive: true,
    });

    const { approveArchitectRequest } = await import(
      "@/lib/users/architect-request-mutations"
    );

    await expect(
      approveArchitectRequest(
        { id: "admin-1", email: "admin@example.com", role: "admin" },
        "507f1f77bcf86cd799439011",
      ),
    ).rejects.toThrow("המשתמש אינו ממתין לאישור הרשאת אדריכל.");
  });
});
