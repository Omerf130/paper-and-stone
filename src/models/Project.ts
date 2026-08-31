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
import {
  PROJECT_ITEM_STATUSES,
  type ProjectItemStatus,
  type ProjectItemStatusChangeRole,
} from "@/types/project-item-status";
import {
  PROJECT_ITEM_LOGISTICS_STATUSES,
  type ProjectItemLogisticsStatus,
} from "@/types/project-item-logistics";

export interface IProjectItemStatusHistoryEntry {
  from: ProjectItemStatus;
  to: ProjectItemStatus;
  changedByUserId: Types.ObjectId;
  changedByRole: ProjectItemStatusChangeRole;
  changedAt: Date;
}

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
  /** Product price (authoritative admin input). */
  internalCostAgorot?: number;
  /** @deprecated Pricing V1 admin layer — retained for migration reads only */
  adminMarkupBp?: number;
  /** @deprecated Not V2 source of truth — retained for migration reads only */
  architectPriceAgorot?: number;
  /** Architect margin-share percentage (basis points, authoritative admin input). */
  architectMarkupBp?: number;
  /** Derived snapshot — share of commercial margin. */
  architectProfitAgorot?: number;
  /** Final client unit price (authoritative admin input, pre-VAT). */
  clientPriceAgorot?: number;
  /** @deprecated Pricing V1 — use pricingReviewStatus */
  clientPriceStale?: boolean;
  pricingReviewStatus?: "none" | "needs_review";
  priceVersion: number;
  pricedAt?: Date;
  pricedByAdminUserId?: Types.ObjectId;
  /** @deprecated Pricing V1 — architect no longer prices items */
  clientPricedAt?: Date;
  /** @deprecated Pricing V1 — architect no longer prices items */
  clientPricedByArchitectUserId?: Types.ObjectId;
}

export interface IProjectItemLogistics {
  status: ProjectItemLogisticsStatus;
  note?: string;
  updatedAt?: Date;
  updatedByAdminUserId?: Types.ObjectId;
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
  logistics?: IProjectItemLogistics;
  status?: ProjectItemStatus;
  statusHistory?: IProjectItemStatusHistoryEntry[];
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
  adminPricingRevision?: number;
  adminPricingDeliveredRevision?: number;
  architectAdminPricingSeenRevision?: number;
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
    architectProfitAgorot: { type: Number, min: 0 },
    clientPriceAgorot: { type: Number, min: 0 },
    clientPriceStale: { type: Boolean, default: false },
    pricingReviewStatus: {
      type: String,
      enum: ["none", "needs_review"],
      default: "none",
    },
    priceVersion: { type: Number, default: 0, min: 0, required: true },
    pricedAt: { type: Date },
    pricedByAdminUserId: { type: Schema.Types.ObjectId, ref: "User" },
    clientPricedAt: { type: Date },
    clientPricedByArchitectUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false },
);

const projectItemStatusHistorySchema = new Schema<IProjectItemStatusHistoryEntry>(
  {
    from: {
      type: String,
      enum: PROJECT_ITEM_STATUSES,
      required: true,
    },
    to: {
      type: String,
      enum: PROJECT_ITEM_STATUSES,
      required: true,
    },
    changedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedByRole: {
      type: String,
      enum: ["admin", "architect", "client"],
      required: true,
    },
    changedAt: { type: Date, default: Date.now, required: true },
  },
  { _id: false },
);

const projectItemLogisticsSchema = new Schema<IProjectItemLogistics>(
  {
    status: {
      type: String,
      enum: PROJECT_ITEM_LOGISTICS_STATUSES,
      default: "not_ordered",
      required: true,
    },
    note: { type: String, trim: true, maxlength: 500 },
    updatedAt: { type: Date },
    updatedByAdminUserId: { type: Schema.Types.ObjectId, ref: "User" },
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
    logistics: { type: projectItemLogisticsSchema },
    status: {
      type: String,
      enum: PROJECT_ITEM_STATUSES,
      default: "draft",
    },
    statusHistory: {
      type: [projectItemStatusHistorySchema],
      default: [],
    },
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
    adminPricingRevision: { type: Number, default: 0, min: 0 },
    adminPricingDeliveredRevision: { type: Number, default: 0, min: 0 },
    architectAdminPricingSeenRevision: { type: Number, default: 0, min: 0 },
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
