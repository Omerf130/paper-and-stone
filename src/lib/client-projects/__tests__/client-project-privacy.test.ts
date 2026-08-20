import { describe, expect, it } from "vitest";
import { mapClientProjectListItemView } from "@/lib/client-projects/mapClientProjectListItemView";
import { getClientProjectPresentationState } from "@/lib/client-projects/getClientProjectPresentationState";
import {
  assertNoForbiddenClientSnapshotKeys,
  collectObjectKeys,
} from "@/lib/client-snapshots/__tests__/client-snapshot-privacy-helpers";
import type { ClientApprovedProjectView } from "@/types/client-approved-project";

const snapshot: ClientApprovedProjectView = {
  id: "snap-1",
  projectId: "proj-1",
  clientUserId: "client-1",
  architectUserId: "arch-1",
  projectName: "Villa",
  submissionRevision: 1,
  approvedAt: "2026-01-01T00:00:00.000Z",
  architect: { fullName: "Architect" },
  rooms: [
    {
      roomId: "room-1",
      name: "סלון",
      order: 0,
      clientRoomTotalAgorot: 100000,
      items: [
        {
          projectItemId: "item-1",
          productName: "Chair",
          productCode: "CH-1",
          configuration: { material: "עץ" },
          quantity: 1,
          clientUnitPriceAgorot: 100000,
          clientLineTotalAgorot: 100000,
        },
      ],
    },
  ],
  clientProjectTotalAgorot: 100000,
  schemaVersion: 1,
};

describe("client project privacy", () => {
  it("list view contains no forbidden pricing keys", () => {
    const listItem = mapClientProjectListItemView({
      project: {
        projectId: "proj-1",
        projectName: "Villa",
        ownerUserId: "arch-1",
        status: "approved",
        commercialDirty: false,
        submissionRevision: 1,
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
      snapshot,
      architectFullName: "Architect",
    });

    assertNoForbiddenClientSnapshotKeys(listItem);

    const keys = collectObjectKeys(listItem);
    expect(keys.has("items")).toBe(false);
    expect(keys.has("clientPriceStale")).toBe(false);
  });

  it("presentation state contains no internal workflow keys", () => {
    const state = getClientProjectPresentationState({
      hasApprovedSnapshot: true,
      projectStatus: "submitted",
      commercialDirty: true,
      liveSubmissionRevision: 2,
      snapshotSubmissionRevision: 1,
    });

    assertNoForbiddenClientSnapshotKeys(state);
    expect(JSON.stringify(state)).not.toContain("commercialDirty");
    expect(JSON.stringify(state)).not.toContain("submitted");
  });
});
