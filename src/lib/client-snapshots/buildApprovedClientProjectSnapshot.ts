import type { IProject, IProjectItem } from "@/models/Project";
import type { IProjectRoom } from "@/models/ProjectRoom";
import {
  CLIENT_APPROVED_PROJECT_SNAPSHOT_SCHEMA_VERSION,
} from "@/models/ClientApprovedProjectSnapshot";
import {
  calculateLineTotalAgorot,
  sumLineTotalsAgorot,
} from "@/lib/pricing/pricing-calculations";
import { calculateLayeredPricingVatTotals } from "@/lib/pricing/pricing-vat";
import { groupItemsByRoomId } from "@/lib/projects/project-room-helpers";
import { resolveApprovedClientSnapshotImage } from "@/lib/client-snapshots/resolveApprovedClientSnapshotImage";
import type { ProductThumbnailView } from "@/lib/products/loadProductThumbnailMap";
import type { ClientApprovedProjectSnapshotPayload } from "@/types/client-approved-project";

type BuildApprovedClientProjectSnapshotInput = {
  project: IProject;
  rooms: IProjectRoom[];
  architectFullName: string;
  productThumbnailsById: Record<string, ProductThumbnailView>;
  approvedAt: Date;
};

function mapItemToSnapshot(
  item: IProjectItem,
  productThumbnailsById: Record<string, ProductThumbnailView>,
) {
  const clientUnitPriceAgorot = item.pricing!.clientPriceAgorot!;
  const clientLineTotalAgorot = calculateLineTotalAgorot(
    clientUnitPriceAgorot,
    item.quantity,
  );
  const productId = item.productId.toString();
  const thumbnail = productThumbnailsById[productId];
  const image = resolveApprovedClientSnapshotImage(
    thumbnail,
    item.snapshot.productName,
  );

  return {
    projectItemId: item._id.toString(),
    productId,
    productName: item.snapshot.productName,
    productSlug: item.snapshot.productSlug,
    productCode:
      item.snapshot.sku ??
      item.snapshot.productSlug ??
      item.snapshot.productName,
    ...(image ? { image } : {}),
    configuration: {
      ...(item.snapshot.materialName ? { material: item.snapshot.materialName } : {}),
      ...(item.snapshot.colorName ? { color: item.snapshot.colorName } : {}),
      ...(item.snapshot.colorHex ? { colorHex: item.snapshot.colorHex } : {}),
      ...(item.snapshot.sizeLabel ? { size: item.snapshot.sizeLabel } : {}),
    },
    quantity: item.quantity,
    clientUnitPriceAgorot,
    clientLineTotalAgorot,
  };
}

export function buildApprovedClientProjectSnapshot(
  input: BuildApprovedClientProjectSnapshotInput,
): ClientApprovedProjectSnapshotPayload {
  const { project, rooms, architectFullName, productThumbnailsById, approvedAt } =
    input;
  const itemsByRoomId = groupItemsByRoomId(project.items);
  const sortedRooms = [...rooms].sort((a, b) => a.order - b.order);
  const roomSnapshots = sortedRooms.map((room) => {
    const roomItems = (itemsByRoomId.get(room._id.toString()) ?? []) as IProjectItem[];
    const itemSnapshots = roomItems.map((item) =>
      mapItemToSnapshot(item, productThumbnailsById),
    );
    const lineTotals = itemSnapshots.map((item) => item.clientLineTotalAgorot);

    return {
      roomId: room._id.toString(),
      name: room.name,
      order: room.order,
      items: itemSnapshots,
      clientRoomTotalAgorot: sumLineTotalsAgorot(lineTotals),
    };
  });

  const clientProjectSubtotalAgorot = sumLineTotalsAgorot(
    roomSnapshots.map((room) => room.clientRoomTotalAgorot),
  );
  const vatTotals = calculateLayeredPricingVatTotals(clientProjectSubtotalAgorot);

  return {
    schemaVersion: CLIENT_APPROVED_PROJECT_SNAPSHOT_SCHEMA_VERSION,
    projectId: project._id.toString(),
    clientUserId: project.clientUserId!.toString(),
    architectUserId: project.ownerUserId.toString(),
    projectName: project.name,
    location: project.location,
    description: project.description,
    submissionRevision: project.submissionRevision,
    approvedAt,
    architect: { fullName: architectFullName },
    rooms: roomSnapshots,
    clientProjectTotalAgorot: clientProjectSubtotalAgorot,
    clientProjectSubtotalAgorot,
    vatRateBasisPoints: vatTotals.vatRateBasisPoints,
    vatAmountAgorot: vatTotals.vatAmountAgorot,
    clientProjectTotalInclVatAgorot: vatTotals.clientTotalInclVatAgorot,
  };
}
