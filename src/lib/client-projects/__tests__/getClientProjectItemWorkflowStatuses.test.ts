import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";
import { collectObjectKeys } from "@/lib/client-snapshots/__tests__/client-snapshot-privacy-helpers";

const findOneMock = vi.fn();
const workflowSettingsMock = vi.fn();

const projectId = "507f1f77bcf86cd799439011";
const itemId = "507f1f77bcf86cd799439012";
const clientUserId = "507f1f77bcf86cd799439015";

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn(),
}));

vi.mock("@/models/Project", () => ({
  default: {
    findOne: findOneMock,
  },
}));

vi.mock("@/lib/project-items/get-project-item-workflow-settings", () => ({
  getProjectItemWorkflowSettings: workflowSettingsMock,
}));

const FORBIDDEN_LIVE_ITEM_KEYS = [
  "internalCostAgorot",
  "adminMarkupBp",
  "architectPriceAgorot",
  "architectMarkupBp",
  "clientPriceAgorot",
  "snapshot",
  "pricing",
  "selectedMaterialId",
  "selectedColorId",
  "selectedSizeKey",
  "quantity",
  "productId",
];

describe("getClientProjectItemWorkflowStatuses", () => {
  beforeEach(() => {
    findOneMock.mockReset();
    workflowSettingsMock.mockReset();
    workflowSettingsMock.mockResolvedValue({
      transitions: [
        {
          from: "client_review",
          to: "client_approved",
          allowedRoles: ["client"],
        },
      ],
    });
  });

  it("returns workflow status only for snapshot projectItemIds", async () => {
    findOneMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        items: [
          {
            _id: new Types.ObjectId(itemId),
            status: "client_review",
          },
          {
            _id: new Types.ObjectId("507f1f77bcf86cd799439099"),
            status: "draft",
          },
        ],
      }),
    });

    const { getClientProjectItemWorkflowStatuses } = await import(
      "@/lib/client-projects/getClientProjectItemWorkflowStatuses"
    );

    const results = await getClientProjectItemWorkflowStatuses(
      clientUserId,
      projectId,
      [itemId],
    );

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      projectItemId: itemId,
      status: "client_review",
      allowedTargetStatuses: ["client_approved"],
      presentation: expect.objectContaining({
        label: expect.any(String),
        tone: expect.any(String),
      }),
    });
  });

  it("does not expose live item pricing or configuration fields", async () => {
    findOneMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        items: [
          {
            _id: new Types.ObjectId(itemId),
            status: "client_review",
            pricing: {
              internalCostAgorot: 100_000,
              architectPriceAgorot: 140_000,
            },
            snapshot: { productName: "Sofa" },
            quantity: 2,
          },
        ],
      }),
    });

    const { getClientProjectItemWorkflowStatuses } = await import(
      "@/lib/client-projects/getClientProjectItemWorkflowStatuses"
    );

    const results = await getClientProjectItemWorkflowStatuses(
      clientUserId,
      projectId,
      [itemId],
    );

    const keys = collectObjectKeys(results);
    for (const forbidden of FORBIDDEN_LIVE_ITEM_KEYS) {
      expect(keys.has(forbidden)).toBe(false);
    }
  });

  it("returns empty when client is not assigned", async () => {
    findOneMock.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const { getClientProjectItemWorkflowStatuses } = await import(
      "@/lib/client-projects/getClientProjectItemWorkflowStatuses"
    );

    const results = await getClientProjectItemWorkflowStatuses(
      clientUserId,
      projectId,
      [itemId],
    );

    expect(results).toEqual([]);
  });
});
