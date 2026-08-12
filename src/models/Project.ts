import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import {
  PROJECT_REVIEW_ACTIONS,
  PROJECT_STATUSES,
  type ProjectReviewAction,
  type ProjectReviewActorRole,
  type ProjectStatus,
} from "@/types/project";

export interface IProjectItemSnapshot {
  productName: string;
  productSlug: string;
  sku?: string;
  materialName?: string;
  colorName?: string;
  colorHex?: string;
  sizeLabel?: string;
}

export interface IProjectItem {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  selectedMaterialId: string | null;
  selectedColorId: string | null;
  selectedSizeKey: string | null;
  quantity: number;
  snapshot: IProjectItemSnapshot;
}

export interface IProjectReviewHistoryEntry {
  action: ProjectReviewAction;
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  message?: string;
  actorUserId: Types.ObjectId;
  actorRole: ProjectReviewActorRole;
  createdAt: Date;
}

export interface IProject extends Document {
  ownerUserId: Types.ObjectId;
  name: string;
  clientName?: string;
  location?: string;
  description?: string;
  status: ProjectStatus;
  items: IProjectItem[];
  reviewHistory: IProjectReviewHistoryEntry[];
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedByUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectItemSnapshotSchema = new Schema<IProjectItemSnapshot>(
  {
    productName: { type: String, required: true },
    productSlug: { type: String, required: true },
    sku: { type: String },
    materialName: { type: String },
    colorName: { type: String },
    colorHex: { type: String },
    sizeLabel: { type: String },
  },
  { _id: false },
);

const projectItemSchema = new Schema<IProjectItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    selectedMaterialId: { type: String, default: null },
    selectedColorId: { type: String, default: null },
    selectedSizeKey: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1, max: 999 },
    snapshot: { type: projectItemSnapshotSchema, required: true },
  },
  { _id: true },
);

const projectReviewHistorySchema = new Schema<IProjectReviewHistoryEntry>(
  {
    action: {
      type: String,
      enum: PROJECT_REVIEW_ACTIONS,
      required: true,
    },
    fromStatus: {
      type: String,
      enum: PROJECT_STATUSES,
      required: true,
    },
    toStatus: {
      type: String,
      enum: PROJECT_STATUSES,
      required: true,
    },
    message: { type: String, trim: true },
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: {
      type: String,
      enum: ["professional", "admin"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { _id: true },
);

const projectSchema = new Schema<IProject>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    clientName: { type: String, trim: true },
    location: { type: String, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: "draft",
      required: true,
    },
    items: { type: [projectItemSchema], default: [] },
    reviewHistory: { type: [projectReviewHistorySchema], default: [] },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

projectSchema.index({ ownerUserId: 1, updatedAt: -1 });
projectSchema.index({ ownerUserId: 1, status: 1 });
projectSchema.index({ status: 1, submittedAt: -1 });

const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>("Project", projectSchema);

export default Project;
