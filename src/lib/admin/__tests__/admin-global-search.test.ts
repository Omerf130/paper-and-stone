import { describe, expect, it, vi, beforeEach } from "vitest";

const projectFindMock = vi.fn();
const productFindMock = vi.fn();
const resolveMatchIdsMock = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    find: projectFindMock,
  },
}));

vi.mock("@/models/Product", () => ({
  default: {
    find: productFindMock,
  },
}));

vi.mock("@/lib/projects/admin-project-search", () => ({
  resolveAdminProjectSearchMatchIds: resolveMatchIdsMock,
  buildAdminProjectSearchOrClause: vi.fn(() => ({ $or: [{ name: /villa/i }] })),
}));

describe("searchAdminGlobal", () => {
  beforeEach(() => {
    projectFindMock.mockReset();
    productFindMock.mockReset();
    resolveMatchIdsMock.mockReset();
    resolveMatchIdsMock.mockResolvedValue({
      ownerUserIds: [],
      clientUserIds: [],
    });
  });

  it("returns empty results for short queries", async () => {
    const { searchAdminGlobal } = await import("@/lib/admin/admin-global-search");

    const result = await searchAdminGlobal("a");

    expect(result).toEqual({ projects: [], products: [] });
    expect(projectFindMock).not.toHaveBeenCalled();
    expect(productFindMock).not.toHaveBeenCalled();
  });

  it("returns grouped project and product matches", async () => {
    projectFindMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
              {
                _id: { toString: () => "p1" },
                name: "Villa A",
                location: "Herzliya",
              },
            ]),
          }),
        }),
      }),
    });
    productFindMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
              {
                _id: { toString: () => "prod1" },
                nameHe: "כיסא Villa",
                sku: "VIL-01",
              },
            ]),
          }),
        }),
      }),
    });

    const { searchAdminGlobal } = await import("@/lib/admin/admin-global-search");

    const result = await searchAdminGlobal("villa");

    expect(result.projects).toEqual([
      { id: "p1", name: "Villa A", location: "Herzliya" },
    ]);
    expect(result.products).toEqual([
      { id: "prod1", nameHe: "כיסא Villa", sku: "VIL-01" },
    ]);
  });
});
