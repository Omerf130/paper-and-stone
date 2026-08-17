import { describe, expect, it, vi, beforeEach } from "vitest";

const countDocumentsMock = vi.fn();
const findMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  default: {
    countDocuments: countDocumentsMock,
    find: findMock,
  },
}));

describe("architect-request-queries", () => {
  beforeEach(() => {
    countDocumentsMock.mockReset();
    findMock.mockReset();
  });

  it("counts only active client users with requestedRole architect", async () => {
    countDocumentsMock.mockResolvedValue(3);

    const { countPendingArchitectRequests } = await import(
      "@/lib/users/architect-request-queries"
    );

    const count = await countPendingArchitectRequests();

    expect(count).toBe(3);
    expect(countDocumentsMock).toHaveBeenCalledWith({
      role: { $in: ["client", "customer"] },
      requestedRole: "architect",
      isActive: true,
    });
  });

  it("returns pending architect requests sorted by createdAt desc", async () => {
    const sortMock = vi.fn().mockReturnThis();
    const leanMock = vi.fn().mockResolvedValue([
      {
        _id: { toString: () => "user-1" },
        email: "architect@example.com",
        fullName: "אדריכלית",
        identificationNumber: "123456789",
        role: "client",
        requestedRole: "architect",
        isActive: true,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);

    findMock.mockReturnValue({
      sort: sortMock,
      lean: leanMock,
    });
    sortMock.mockReturnValue({ lean: leanMock });

    const { getPendingArchitectRequests } = await import(
      "@/lib/users/architect-request-queries"
    );

    const requests = await getPendingArchitectRequests();

    expect(findMock).toHaveBeenCalledWith({
      role: { $in: ["client", "customer"] },
      requestedRole: "architect",
      isActive: true,
    });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(requests[0]?.requestedRole).toBe("architect");
    expect(requests[0]?.role).toBe("client");
  });
});
