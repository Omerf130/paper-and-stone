import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { buildApprovedClientProjectSnapshot } from "@/lib/client-snapshots/buildApprovedClientProjectSnapshot";
import { assertNoForbiddenClientSnapshotKeys } from "@/lib/client-snapshots/__tests__/client-snapshot-privacy-helpers";
import type { IProject, IProjectItem } from "@/models/Project";

describe("client snapshot privacy", () => {
  it("does not include internal pricing fields in built payload", () => {
    const roomId = new Types.ObjectId();
    const item = {
      _id: new Types.ObjectId(),
      productId: new Types.ObjectId(),
      roomId,
      quantity: 1,
      snapshot: { productName: "Chair", productSlug: "chair" },
      pricing: {
        internalCostAgorot: 50_000,
        adminMarkupBp: 4000,
        architectPriceAgorot: 70_000,
        architectMarkupBp: 5000,
        clientPriceAgorot: 105_000,
        clientPriceStale: false,
        priceVersion: 3,
      },
    } as IProjectItem;

    const payload = buildApprovedClientProjectSnapshot({
      project: {
        _id: new Types.ObjectId(),
        ownerUserId: new Types.ObjectId(),
        clientUserId: new Types.ObjectId(),
        name: "Test",
        submissionRevision: 1,
        items: [item],
      } as IProject,
      rooms: [{ _id: roomId, name: "Room", order: 0 } as never],
      architectFullName: "Architect",
      productThumbnailsById: {},
      approvedAt: new Date(),
    });

    expect(() => assertNoForbiddenClientSnapshotKeys(payload)).not.toThrow();
    expect(payload.rooms[0]?.items[0]?.clientUnitPriceAgorot).toBe(105_000);
  });
});
