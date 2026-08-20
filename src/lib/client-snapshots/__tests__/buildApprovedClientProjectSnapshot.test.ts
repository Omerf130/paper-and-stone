import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import Project from "@/models/Project";
import { buildApprovedClientProjectSnapshot } from "@/lib/client-snapshots/buildApprovedClientProjectSnapshot";
import type { IProject, IProjectItem } from "@/models/Project";
import type { IProjectRoom } from "@/models/ProjectRoom";

function makeItem(overrides: Partial<IProjectItem> = {}): IProjectItem {
  return {
    _id: new Types.ObjectId(),
    productId: new Types.ObjectId(),
    roomId: new Types.ObjectId(),
    selectedMaterialId: null,
    selectedColorId: null,
    selectedSizeKey: null,
    quantity: 2,
    snapshot: {
      productName: "Sofa",
      productSlug: "sofa",
      sku: "SKU-1",
      materialName: "Leather",
      colorName: "Black",
      sizeLabel: "L",
    },
    pricing: {
      priceVersion: 1,
      clientPriceAgorot: 150_000,
      architectPriceAgorot: 100_000,
      clientPriceStale: false,
    },
    ...overrides,
  } as IProjectItem;
}

describe("buildApprovedClientProjectSnapshot", () => {
  it("builds ordered rooms with client-only totals and revision", () => {
    const roomAId = new Types.ObjectId();
    const roomBId = new Types.ObjectId();
    const itemA = makeItem({ roomId: roomAId, quantity: 2 });
    const itemB = makeItem({
      _id: new Types.ObjectId(),
      roomId: roomBId,
      quantity: 1,
      snapshot: {
        productName: "Table",
        productSlug: "table",
        sku: "SKU-2",
      },
      pricing: {
        priceVersion: 1,
        clientPriceAgorot: 200_000,
        architectPriceAgorot: 140_000,
        clientPriceStale: false,
      },
    });

    const project = {
      _id: new Types.ObjectId(),
      ownerUserId: new Types.ObjectId(),
      clientUserId: new Types.ObjectId(),
      name: "Villa",
      location: "Tel Aviv",
      description: "Luxury",
      submissionRevision: 2,
      items: [itemA, itemB],
    } as IProject;

    const rooms = [
      { _id: roomBId, name: "Kitchen", order: 1 },
      { _id: roomAId, name: "Living", order: 0 },
    ] as IProjectRoom[];

    const approvedAt = new Date("2026-03-01T10:00:00.000Z");
    const payload = buildApprovedClientProjectSnapshot({
      project,
      rooms,
      architectFullName: "Dana Levi",
      productThumbnailsById: {
        [itemA.productId.toString()]: { url: "https://img/sofa.jpg", altText: "Sofa" },
      },
      approvedAt,
    });

    expect(payload.submissionRevision).toBe(2);
    expect(payload.architect.fullName).toBe("Dana Levi");
    expect(payload.rooms.map((room) => room.name)).toEqual(["Living", "Kitchen"]);
    expect(payload.rooms[0]?.items[0]?.clientLineTotalAgorot).toBe(300_000);
    expect(payload.rooms[1]?.items[0]?.clientLineTotalAgorot).toBe(200_000);
    expect(payload.clientProjectTotalAgorot).toBe(500_000);
    expect(payload.rooms[0]?.items[0]?.image).toEqual({
      url: "https://img/sofa.jpg",
      alt: "Sofa",
    });
    expect(payload.rooms[0]?.items[0]?.configuration.material).toBe("Leather");
  });

  it("builds snapshot from hydrated mongoose project item subdocuments", () => {
    const roomId = new Types.ObjectId();
    const productId = new Types.ObjectId();
    const itemId = new Types.ObjectId();

    const project = new Project({
      ownerUserId: new Types.ObjectId(),
      clientUserId: new Types.ObjectId(),
      name: "Villa",
      onboardingStatus: "active",
      status: "submitted",
      submissionRevision: 1,
      items: [
        {
          _id: itemId,
          productId,
          roomId,
          selectedMaterialId: null,
          selectedColorId: null,
          selectedSizeKey: null,
          quantity: 2,
          snapshot: {
            productName: "Milano Sofa",
            productSlug: "milano-sofa",
            sku: "PS-MIL-001",
          },
          pricing: {
            priceVersion: 1,
            clientPriceAgorot: 180_000,
            architectPriceAgorot: 120_000,
            clientPriceStale: false,
          },
        },
      ],
    });

    const approvedAt = new Date("2026-03-01T10:00:00.000Z");
    const payload = buildApprovedClientProjectSnapshot({
      project,
      rooms: [{ _id: roomId, name: "Living", order: 0 } as IProjectRoom],
      architectFullName: "Dana Levi",
      productThumbnailsById: {
        [productId.toString()]: {
          url: "https://img/sofa.jpg",
          altText: "Milano Sofa",
        },
      },
      approvedAt,
    });

    expect(payload.rooms[0]?.items[0]?.projectItemId).toBe(itemId.toString());
    expect(payload.rooms[0]?.items[0]?.productId).toBe(productId.toString());
    expect(payload.rooms[0]?.items[0]?.productCode).toBe("PS-MIL-001");
    expect(payload.rooms[0]?.items[0]?.clientLineTotalAgorot).toBe(360_000);
    expect(payload.clientProjectTotalAgorot).toBe(360_000);
  });

  it("uses product name as image alt when thumbnail url exists without alt", () => {
    const roomId = new Types.ObjectId();
    const productId = new Types.ObjectId();
    const item = makeItem({
      roomId,
      productId,
      snapshot: {
        productName: "ספת Milano",
        productSlug: "milano-sofa",
        sku: "PS-MIL-001",
      },
    });

    const payload = buildApprovedClientProjectSnapshot({
      project: {
        _id: new Types.ObjectId(),
        ownerUserId: new Types.ObjectId(),
        clientUserId: new Types.ObjectId(),
        name: "Villa",
        submissionRevision: 1,
        items: [item],
      } as IProject,
      rooms: [{ _id: roomId, name: "Living", order: 0 } as IProjectRoom],
      architectFullName: "Architect",
      productThumbnailsById: {
        [productId.toString()]: {
          url: "https://img/sofa.jpg",
          altText: "",
        },
      },
      approvedAt: new Date(),
    });

    expect(payload.rooms[0]?.items[0]?.image).toEqual({
      url: "https://img/sofa.jpg",
      alt: "ספת Milano",
    });
  });

  it("omits image when thumbnail url is absent", () => {
    const roomId = new Types.ObjectId();
    const item = makeItem({ roomId });

    const payload = buildApprovedClientProjectSnapshot({
      project: {
        _id: new Types.ObjectId(),
        ownerUserId: new Types.ObjectId(),
        clientUserId: new Types.ObjectId(),
        name: "Villa",
        submissionRevision: 1,
        items: [item],
      } as IProject,
      rooms: [{ _id: roomId, name: "Living", order: 0 } as IProjectRoom],
      architectFullName: "Architect",
      productThumbnailsById: {},
      approvedAt: new Date(),
    });

    expect(payload.rooms[0]?.items[0]?.image).toBeUndefined();
  });
});
