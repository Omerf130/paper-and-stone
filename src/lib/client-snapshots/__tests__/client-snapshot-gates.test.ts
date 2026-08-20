import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import {
  assertItemsAssignedToValidRooms,
  getCommercialApprovalBlockedReason,
} from "@/lib/client-snapshots/client-snapshot-gates";
import { CLIENT_SNAPSHOT_ERRORS } from "@/lib/client-snapshots/client-snapshot-errors";
import type { IProjectItem } from "@/models/Project";

describe("client-snapshot-gates", () => {
  const roomId = new Types.ObjectId();

  it("blocks when item has no room", () => {
    expect(() =>
      assertItemsAssignedToValidRooms(
        [
          {
            roomId: null,
          } as IProjectItem,
        ],
        [{ _id: roomId } as never],
      ),
    ).toThrow(CLIENT_SNAPSHOT_ERRORS.ORPHAN_ITEMS_NOT_IN_ROOM);
  });

  it("returns orphan reason in blocked reason helper", () => {
    expect(
      getCommercialApprovalBlockedReason(
        {
          onboardingStatus: "active",
          clientUserId: new Types.ObjectId(),
          items: [
            {
              pricing: {
                architectPriceAgorot: 100_000,
                clientPriceAgorot: 150_000,
                clientPriceStale: false,
              },
              roomId: null,
            },
          ],
        } as never,
        [{ _id: roomId } as never],
      ),
    ).toBe(CLIENT_SNAPSHOT_ERRORS.ORPHAN_ITEMS_NOT_IN_ROOM);
  });

  it("returns client required reason when unassigned", () => {
    expect(
      getCommercialApprovalBlockedReason(
        {
          onboardingStatus: "active",
          clientUserId: null,
          items: [],
        } as never,
        [],
      ),
    ).toBe(CLIENT_SNAPSHOT_ERRORS.CLIENT_REQUIRED_FOR_APPROVAL);
  });
});
