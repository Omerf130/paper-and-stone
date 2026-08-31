import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export const CLIENT_APPROVED_PROJECT_SNAPSHOT_SCHEMA_VERSION = 2;

export interface IClientApprovedProjectImageSnapshot {
  url: string;
  alt: string;
}

export interface IClientApprovedItemConfigurationSnapshot {
  material?: string;
  color?: string;
  colorHex?: string;
  size?: string;
}

export interface IClientApprovedProjectItemSnapshot {
  projectItemId: Types.ObjectId;
  productId?: Types.ObjectId;
  productName: string;
  productSlug?: string;
  productCode: string;
  image?: IClientApprovedProjectImageSnapshot;
  configuration: IClientApprovedItemConfigurationSnapshot;
  quantity: number;
  clientUnitPriceAgorot: number;
  clientLineTotalAgorot: number;
}

export interface IClientApprovedRoomSnapshot {
  roomId: Types.ObjectId;
  name: string;
  order: number;
  items: IClientApprovedProjectItemSnapshot[];
  clientRoomTotalAgorot: number;
}

export interface IClientApprovedArchitectSnapshot {
  fullName: string;
}

export interface IClientApprovedProjectSnapshot extends Document {
  schemaVersion: number;
  projectId: Types.ObjectId;
  clientUserId: Types.ObjectId;
  architectUserId: Types.ObjectId;
  projectName: string;
  location?: string;
  description?: string;
  submissionRevision: number;
  approvedAt: Date;
  architect: IClientApprovedArchitectSnapshot;
  rooms: IClientApprovedRoomSnapshot[];
  /** Client subtotal before VAT */
  clientProjectTotalAgorot: number;
  clientProjectSubtotalAgorot?: number;
  vatRateBasisPoints?: number;
  vatAmountAgorot?: number;
  clientProjectTotalInclVatAgorot?: number;
  createdAt: Date;
  updatedAt: Date;
}

const imageSnapshotSchema = new Schema<IClientApprovedProjectImageSnapshot>(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false },
);

const configurationSnapshotSchema =
  new Schema<IClientApprovedItemConfigurationSnapshot>(
    {
      material: { type: String },
      color: { type: String },
      colorHex: { type: String },
      size: { type: String },
    },
    { _id: false },
  );

const itemSnapshotSchema = new Schema<IClientApprovedProjectItemSnapshot>(
  {
    projectItemId: { type: Schema.Types.ObjectId, required: true },
    productId: { type: Schema.Types.ObjectId },
    productName: { type: String, required: true },
    productSlug: { type: String },
    productCode: { type: String, required: true },
    image: { type: imageSnapshotSchema },
    configuration: { type: configurationSnapshotSchema, required: true },
    quantity: { type: Number, required: true, min: 1 },
    clientUnitPriceAgorot: { type: Number, required: true, min: 0 },
    clientLineTotalAgorot: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const roomSnapshotSchema = new Schema<IClientApprovedRoomSnapshot>(
  {
    roomId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    order: { type: Number, required: true, min: 0 },
    items: { type: [itemSnapshotSchema], default: [] },
    clientRoomTotalAgorot: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const architectSnapshotSchema = new Schema<IClientApprovedArchitectSnapshot>(
  {
    fullName: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const clientApprovedProjectSnapshotSchema =
  new Schema<IClientApprovedProjectSnapshot>(
    {
      schemaVersion: {
        type: Number,
        default: CLIENT_APPROVED_PROJECT_SNAPSHOT_SCHEMA_VERSION,
        required: true,
      },
      projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        unique: true,
      },
      clientUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      architectUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      projectName: { type: String, required: true, trim: true },
      location: { type: String, trim: true },
      description: { type: String, trim: true },
      submissionRevision: { type: Number, required: true, min: 0 },
      approvedAt: { type: Date, required: true },
      architect: { type: architectSnapshotSchema, required: true },
      rooms: { type: [roomSnapshotSchema], default: [] },
      clientProjectTotalAgorot: { type: Number, required: true, min: 0 },
      clientProjectSubtotalAgorot: { type: Number, min: 0 },
      vatRateBasisPoints: { type: Number, min: 0 },
      vatAmountAgorot: { type: Number, min: 0 },
      clientProjectTotalInclVatAgorot: { type: Number, min: 0 },
    },
    { timestamps: true },
  );

clientApprovedProjectSnapshotSchema.index({ clientUserId: 1, approvedAt: -1 });

const ClientApprovedProjectSnapshot: Model<IClientApprovedProjectSnapshot> =
  mongoose.models.ClientApprovedProjectSnapshot ??
  mongoose.model<IClientApprovedProjectSnapshot>(
    "ClientApprovedProjectSnapshot",
    clientApprovedProjectSnapshotSchema,
  );

export default ClientApprovedProjectSnapshot;
