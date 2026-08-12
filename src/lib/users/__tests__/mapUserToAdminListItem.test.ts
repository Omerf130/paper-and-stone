import { describe, expect, it } from "vitest";
import { mapLeanUserToAdminListItem } from "@/lib/users/mapUserToAdminListItem";

describe("mapLeanUserToAdminListItem", () => {
  it("excludes passwordHash and exposes safe fields only", () => {
    const item = mapLeanUserToAdminListItem({
      _id: { toString: () => "user-1" },
      email: "user@example.com",
      role: "customer",
      isActive: true,
      createdAt: new Date("2026-01-01T10:00:00.000Z"),
      updatedAt: new Date("2026-01-02T10:00:00.000Z"),
    });

    expect(item).toEqual({
      id: "user-1",
      email: "user@example.com",
      role: "customer",
      isActive: true,
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-02T10:00:00.000Z",
    });
    expect(item).not.toHaveProperty("passwordHash");
  });
});
