import { describe, expect, it } from "vitest";
import { mapUserToAdminListItem } from "@/lib/users/mapUserToAdminListItem";

describe("mapUserToAdminListItem", () => {
  it("maps admin fields including identificationNumber", () => {
    const item = mapUserToAdminListItem({
      _id: { toString: () => "user-id" },
      email: "user@example.com",
      fullName: "ישראל ישראלי",
      identificationNumber: "123456789",
      role: "client",
      requestedRole: "architect",
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    } as never);

    expect(item).toEqual({
      id: "user-id",
      email: "user@example.com",
      fullName: "ישראל ישראלי",
      identificationNumber: "123456789",
      role: "client",
      requestedRole: "architect",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  });

  it("normalizes legacy customer role", () => {
    const item = mapUserToAdminListItem({
      _id: { toString: () => "user-id" },
      email: "user@example.com",
      role: "customer",
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    } as never);

    expect(item.role).toBe("client");
  });
});
