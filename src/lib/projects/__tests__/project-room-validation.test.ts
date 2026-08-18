import { describe, expect, it } from "vitest";
import {
  parseProjectRoomName,
  parseProjectRoomReorderIds,
} from "@/lib/projects/project-room-validation";
import { PROJECT_ROOM_ERRORS } from "@/types/project-room";

describe("parseProjectRoomName", () => {
  it("accepts trimmed room names within max length", () => {
    expect(parseProjectRoomName("  סלון  ")).toEqual({
      success: true,
      data: "סלון",
    });
  });

  it("rejects empty names", () => {
    expect(parseProjectRoomName("   ").success).toBe(false);
  });
});

describe("parseProjectRoomReorderIds", () => {
  const validId = "507f1f77bcf86cd799439011";
  const validId2 = "507f1f77bcf86cd799439012";

  it("accepts valid unique room id list", () => {
    expect(parseProjectRoomReorderIds([validId, validId2])).toEqual({
      success: true,
      data: [validId, validId2],
    });
  });

  it("rejects duplicate ids", () => {
    expect(parseProjectRoomReorderIds([validId, validId])).toEqual({
      success: false,
      error: PROJECT_ROOM_ERRORS.INVALID_REORDER,
    });
  });

  it("rejects invalid object ids", () => {
    expect(parseProjectRoomReorderIds(["not-an-id"])).toEqual({
      success: false,
      error: PROJECT_ROOM_ERRORS.INVALID_REORDER,
    });
  });
});
