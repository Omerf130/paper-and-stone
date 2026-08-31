import type { IClientApprovedProjectSnapshot } from "@/models/ClientApprovedProjectSnapshot";
import type {
  ClientApprovedProjectItemView,
  ClientApprovedProjectRoomView,
  ClientApprovedProjectView,
} from "@/types/client-approved-project";

type SnapshotLike = Pick<
  IClientApprovedProjectSnapshot,
  | "_id"
  | "schemaVersion"
  | "projectId"
  | "clientUserId"
  | "architectUserId"
  | "projectName"
  | "location"
  | "description"
  | "submissionRevision"
  | "approvedAt"
  | "architect"
  | "rooms"
  | "clientProjectTotalAgorot"
  | "clientProjectSubtotalAgorot"
  | "vatRateBasisPoints"
  | "vatAmountAgorot"
  | "clientProjectTotalInclVatAgorot"
>;

function mapItemToView(
  item: IClientApprovedProjectSnapshot["rooms"][number]["items"][number],
): ClientApprovedProjectItemView {
  return {
    projectItemId: item.projectItemId.toString(),
    productId: item.productId?.toString(),
    productName: item.productName,
    productSlug: item.productSlug,
    productCode: item.productCode,
    image: item.image
      ? { url: item.image.url, alt: item.image.alt }
      : undefined,
    configuration: {
      material: item.configuration.material,
      color: item.configuration.color,
      colorHex: item.configuration.colorHex,
      size: item.configuration.size,
    },
    quantity: item.quantity,
    clientUnitPriceAgorot: item.clientUnitPriceAgorot,
    clientLineTotalAgorot: item.clientLineTotalAgorot,
  };
}

function mapRoomToView(
  room: IClientApprovedProjectSnapshot["rooms"][number],
): ClientApprovedProjectRoomView {
  return {
    roomId: room.roomId.toString(),
    name: room.name,
    order: room.order,
    items: room.items.map(mapItemToView),
    clientRoomTotalAgorot: room.clientRoomTotalAgorot,
  };
}

export function mapClientApprovedProjectSnapshotToView(
  snapshot: SnapshotLike,
): ClientApprovedProjectView {
  return {
    id: snapshot._id.toString(),
    projectId: snapshot.projectId.toString(),
    clientUserId: snapshot.clientUserId.toString(),
    architectUserId: snapshot.architectUserId.toString(),
    projectName: snapshot.projectName,
    location: snapshot.location,
    description: snapshot.description,
    submissionRevision: snapshot.submissionRevision,
    approvedAt: snapshot.approvedAt.toISOString(),
    architect: { fullName: snapshot.architect.fullName },
    rooms: snapshot.rooms.map(mapRoomToView),
    clientProjectTotalAgorot: snapshot.clientProjectTotalAgorot,
    clientProjectSubtotalAgorot: snapshot.clientProjectSubtotalAgorot,
    vatRateBasisPoints: snapshot.vatRateBasisPoints,
    vatAmountAgorot: snapshot.vatAmountAgorot,
    clientProjectTotalInclVatAgorot: snapshot.clientProjectTotalInclVatAgorot,
    schemaVersion: snapshot.schemaVersion,
  };
}
