import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import {
  PROJECT_ONBOARDING_STATUSES,
  PROJECT_REVIEW_ACTIONS,
  PROJECT_STATUSES,
  type ProjectOnboardingStatus,
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

export interface IProjectItemPricing {
  internalCostAgorot?: number;
  adminMarkupBp?: number;
  architectPriceAgorot?: number;
  architectMarkupBp?: number;
  clientPriceAgorot?: number;
  clientPriceStale?: boolean;
  priceVersion: number;
  pricedAt?: Date;
  pricedByAdminUserId?: Types.ObjectId;
  clientPricedAt?: Date;
  clientPricedByArchitectUserId?: Types.ObjectId;
}

export interface IProjectItem {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  roomId?: Types.ObjectId | null;
  selectedMaterialId: string | null;
  selectedColorId: string | null;
  selectedSizeKey: string | null;
  quantity: number;
  snapshot: IProjectItemSnapshot;
  pricing?: IProjectItemPricing;
}

export interface IProjectReviewHistoryEntry {
  _id?: Types.ObjectId;
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
  onboardingStatus?: ProjectOnboardingStatus | null;
  clientUserId?: Types.ObjectId | null;
  clientAssignedAt?: Date;
  clientAssignedByUserId?: Types.ObjectId;
  onboardingApprovedAt?: Date;
  onboardingApprovedByUserId?: Types.ObjectId;
  submissionRevision: number;
  commercialDirty?: boolean;
  commercialDirtyAt?: Date;
  defaultAdminMarkupBp?: number;
  defaultArchitectMarkupBp?: number;
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

const projectItemPricingSchema = new Schema<IProjectItemPricing>(
  {
    internalCostAgorot: { type: Number, min: 0 },
    adminMarkupBp: { type: Number, min: 0 },
    architectPriceAgorot: { type: Number, min: 0 },
    architectMarkupBp: { type: Number, min: 0 },
    clientPriceAgorot: { type: Number, min: 0 },
    clientPriceStale: { type: Boolean, default: false },
    priceVersion: { type: Number, default: 0, min: 0, required: true },
    pricedAt: { type: Date },
    pricedByAdminUserId: { type: Schema.Types.ObjectId, ref: "User" },
    clientPricedAt: { type: Date },
    clientPricedByArchitectUserId: { type: Schema.Types.ObjectId, ref: "User" },
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
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "ProjectRoom",
      default: null,
    },
    selectedMaterialId: { type: String, default: null },
    selectedColorId: { type: String, default: null },
    selectedSizeKey: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1, max: 999 },
    snapshot: { type: projectItemSnapshotSchema, required: true },
    pricing: { type: projectItemPricingSchema },
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
    onboardingStatus: {
      type: String,
      enum: [...PROJECT_ONBOARDING_STATUSES, null],
      default: null,
    },
    clientUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    clientAssignedAt: { type: Date },
    clientAssignedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    onboardingApprovedAt: { type: Date },
    onboardingApprovedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    submissionRevision: { type: Number, default: 0, min: 0, required: true },
    commercialDirty: { type: Boolean, default: false },
    commercialDirtyAt: { type: Date },
    defaultAdminMarkupBp: { type: Number, min: 0 },
    defaultArchitectMarkupBp: { type: Number, min: 0 },
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
projectSchema.index({ onboardingStatus: 1, updatedAt: -1 });
projectSchema.index({ clientUserId: 1, onboardingStatus: 1 });
projectSchema.index({ ownerUserId: 1, onboardingStatus: 1 });

const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>("Project", projectSchema);

export default Project;
