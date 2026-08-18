import { describe, expect, it, vi, beforeEach } from "vitest";

const userFindMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  default: {
    find: userFindMock,
    findOne: vi.fn(),
    findById: vi.fn(),
  },
}));

describe("client-lookup-queries", () => {
  beforeEach(() => {
    userFindMock.mockReset();
  });

  it("searches active clients by name or email without identificationNumber", async () => {
    userFindMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
              {
                _id: { toString: () => "507f1f77bcf86cd799439011" },
                email: "client@example.com",
                fullName: "Client User",
              },
            ]),
          }),
        }),
      }),
    });

    const { searchClientsForAdmin } = await import(
      "@/lib/admin/clients/client-lookup-queries"
    );

    const clients = await searchClientsForAdmin("client");

    expect(clients).toEqual([
      {
        id: "507f1f77bcf86cd799439011",
        email: "client@example.com",
        fullName: "Client User",
      },
    ]);
    expect(userFindMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isActive: true,
        $or: expect.any(Array),
      }),
    );
  });

  it("builds active-client filter for empty query", async () => {
    const { buildClientSearchFilter } = await import(
      "@/lib/admin/clients/client-lookup-queries"
    );

    expect(buildClientSearchFilter("")).toEqual(
      expect.objectContaining({ isActive: true }),
    );
  });
});
