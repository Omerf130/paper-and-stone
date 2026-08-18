import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import {
  computeRoomItemCounts,
  resolveSelectedRoomId,
} from "@/lib/projects/project-room-helpers";

describe("project-room-helpers", () => {
  const roomA = "507f1f77bcf86cd799439011";
  const roomB = "507f1f77bcf86cd799439012";

  it("counts items per room from embedded project items", () => {
    const counts = computeRoomItemCounts(
      [{ _id: new Types.ObjectId(roomA) }, { _id: new Types.ObjectId(roomB) }],
      [
        { roomId: new Types.ObjectId(roomA) },
        { roomId: new Types.ObjectId(roomA) },
        { roomId: new Types.ObjectId(roomB) },
        { roomId: undefined },
      ],
    );

    expect(counts.get(roomA)).toBe(2);
    expect(counts.get(roomB)).toBe(1);
  });

  it("falls back to first room by order when selected id is invalid", () => {
    expect(
      resolveSelectedRoomId(
        [
          { id: roomB, order: 1, name: "מטבח", projectId: "p1", itemCount: 0, createdAt: "", updatedAt: "" },
          { id: roomA, order: 0, name: "סלון", projectId: "p1", itemCount: 0, createdAt: "", updatedAt: "" },
        ],
        "invalid",
      ),
    ).toBe(roomA);
  });

  it("preserves valid selected room id", () => {
    expect(
      resolveSelectedRoomId(
        [
          { id: roomA, order: 0, name: "סלון", projectId: "p1", itemCount: 0, createdAt: "", updatedAt: "" },
          { id: roomB, order: 1, name: "מטבח", projectId: "p1", itemCount: 0, createdAt: "", updatedAt: "" },
        ],
        roomB,
      ),
    ).toBe(roomB);
  });
});
