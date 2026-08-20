import { Types, type Document } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import ClientApprovedProjectSnapshot, {
  type IClientApprovedProjectSnapshot,
} from "@/models/ClientApprovedProjectSnapshot";
import type { ClientApprovedProjectSnapshotPayload } from "@/types/client-approved-project";

export type StoredClientApprovedProjectSnapshot = Omit<
  IClientApprovedProjectSnapshot,
  keyof Document
> & {
  _id: Types.ObjectId;
};

function payloadToDocumentFields(
  payload: ClientApprovedProjectSnapshotPayload,
): Record<string, unknown> {
  return {
    schemaVersion: payload.schemaVersion,
    projectId: new Types.ObjectId(payload.projectId),
    clientUserId: new Types.ObjectId(payload.clientUserId),
    architectUserId: new Types.ObjectId(payload.architectUserId),
    projectName: payload.projectName,
    location: payload.location,
    description: payload.description,
    submissionRevision: payload.submissionRevision,
    approvedAt: payload.approvedAt,
    architect: payload.architect,
    rooms: payload.rooms.map((room) => ({
      roomId: new Types.ObjectId(room.roomId),
      name: room.name,
      order: room.order,
      clientRoomTotalAgorot: room.clientRoomTotalAgorot,
      items: room.items.map((item) => ({
        projectItemId: new Types.ObjectId(item.projectItemId),
        ...(item.productId ? { productId: new Types.ObjectId(item.productId) } : {}),
        productName: item.productName,
        productSlug: item.productSlug,
        productCode: item.productCode,
        image: item.image,
        configuration: item.configuration,
        quantity: item.quantity,
        clientUnitPriceAgorot: item.clientUnitPriceAgorot,
        clientLineTotalAgorot: item.clientLineTotalAgorot,
      })),
    })),
    clientProjectTotalAgorot: payload.clientProjectTotalAgorot,
  };
}

function snapshotDocumentToRestoreFields(
  snapshot: StoredClientApprovedProjectSnapshot,
): Record<string, unknown> {
  return {
    schemaVersion: snapshot.schemaVersion,
    projectId: snapshot.projectId,
    clientUserId: snapshot.clientUserId,
    architectUserId: snapshot.architectUserId,
    projectName: snapshot.projectName,
    location: snapshot.location,
    description: snapshot.description,
    submissionRevision: snapshot.submissionRevision,
    approvedAt: snapshot.approvedAt,
    architect: snapshot.architect,
    rooms: snapshot.rooms,
    clientProjectTotalAgorot: snapshot.clientProjectTotalAgorot,
  };
}

export async function getClientApprovedProjectSnapshotDocument(
  projectId: string,
): Promise<StoredClientApprovedProjectSnapshot | null> {
  if (!Types.ObjectId.isValid(projectId)) {
    return null;
  }

  await connectDB();

  return ClientApprovedProjectSnapshot.findOne({
    projectId: new Types.ObjectId(projectId),
  }).lean() as Promise<StoredClientApprovedProjectSnapshot | null>;
}

export async function upsertClientApprovedProjectSnapshot(
  payload: ClientApprovedProjectSnapshotPayload,
): Promise<void> {
  await connectDB();

  await ClientApprovedProjectSnapshot.findOneAndUpdate(
    { projectId: new Types.ObjectId(payload.projectId) },
    { $set: payloadToDocumentFields(payload) },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
}

export async function restoreClientApprovedProjectSnapshot(
  previousSnapshot: StoredClientApprovedProjectSnapshot,
): Promise<void> {
  await connectDB();

  await ClientApprovedProjectSnapshot.findOneAndUpdate(
    { projectId: previousSnapshot.projectId },
    { $set: snapshotDocumentToRestoreFields(previousSnapshot) },
    { upsert: true, new: true },
  );
}

export async function deleteClientApprovedProjectSnapshot(
  projectId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(projectId)) {
    return;
  }

  await connectDB();

  await ClientApprovedProjectSnapshot.deleteOne({
    projectId: new Types.ObjectId(projectId),
  });
}
