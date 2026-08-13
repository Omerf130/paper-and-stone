import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import {
  PROJECT_QUOTE_STATUSES,
  PROJECT_QUOTE_SUPERSEDE_REASONS,
  QUOTE_TAX_MODES,
  type ProjectQuoteStatus,
  type ProjectQuoteSupersedeReason,
  type QuoteTaxMode,
} from "@/types/project-quote";

export interface IProjectQuoteItemLine {
  projectItemId: Types.ObjectId;
  productId: Types.ObjectId;
  productNameSnapshot: string;
  skuSnapshot?: string;
  configurationSummary: string;
  quantity: number;
  unitPriceAgorot: number;
  lineTotalAgorot: number;
  adminNote?: string;
}

export interface IProjectQuoteAdditionalLine {
  label: string;
  amountAgorot: number;
}

export interface IProjectQuote extends Document {
  projectId: Types.ObjectId;
  professionalUserId: Types.ObjectId;
  version: number;
  submissionRevision: number;
  status: ProjectQuoteStatus;
  currency: "ILS";
  itemLines: IProjectQuoteItemLine[];
  additionalLines: IProjectQuoteAdditionalLine[];
  subtotalAgorot: number;
  adjustmentsAgorot: number;
  taxableBaseAgorot: number;
  taxAmountAgorot: number;
  totalAgorot: number;
  taxMode: QuoteTaxMode;
  vatRateBasisPoints: number;
  generalNote?: string;
  validUntil?: Date;
  changeRequestMessage?: string;
  changeRequestedAt?: Date;
  sentAt?: Date;
  acceptedAt?: Date;
  supersededAt?: Date;
  supersededReason?: ProjectQuoteSupersedeReason;
  createdByAdminUserId: Types.ObjectId;
  sentByAdminUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectQuoteItemLineSchema = new Schema<IProjectQuoteItemLine>(
  {
    projectItemId: { type: Schema.Types.ObjectId, required: true },
    productId: { type: Schema.Types.ObjectId, required: true },
    productNameSnapshot: { type: String, required: true, trim: true },
    skuSnapshot: { type: String, trim: true },
    configurationSummary: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, max: 999 },
    unitPriceAgorot: { type: Number, required: true, min: 0 },
    lineTotalAgorot: { type: Number, required: true, min: 0 },
    adminNote: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const projectQuoteAdditionalLineSchema = new Schema<IProjectQuoteAdditionalLine>(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    amountAgorot: { type: Number, required: true },
  },
  { _id: false },
);

const projectQuoteSchema = new Schema<IProjectQuote>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    professionalUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    version: { type: Number, required: true, min: 0 },
    submissionRevision: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: PROJECT_QUOTE_STATUSES,
      required: true,
    },
    currency: { type: String, enum: ["ILS"], default: "ILS", required: true },
    itemLines: { type: [projectQuoteItemLineSchema], default: [] },
    additionalLines: { type: [projectQuoteAdditionalLineSchema], default: [] },
    subtotalAgorot: { type: Number, required: true },
    adjustmentsAgorot: { type: Number, required: true, default: 0 },
    taxableBaseAgorot: { type: Number, required: true },
    taxAmountAgorot: { type: Number, required: true, default: 0 },
    totalAgorot: { type: Number, required: true },
    taxMode: {
      type: String,
      enum: QUOTE_TAX_MODES,
      default: "exclusive",
      required: true,
    },
    vatRateBasisPoints: { type: Number, required: true, min: 0 },
    generalNote: { type: String, trim: true, maxlength: 2000 },
    validUntil: { type: Date },
    changeRequestMessage: { type: String, trim: true, maxlength: 2000 },
    changeRequestedAt: { type: Date },
    sentAt: { type: Date },
    acceptedAt: { type: Date },
    supersededAt: { type: Date },
    supersededReason: {
      type: String,
      enum: PROJECT_QUOTE_SUPERSEDE_REASONS,
    },
    createdByAdminUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sentByAdminUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

projectQuoteSchema.index({ projectId: 1, version: 1 }, { unique: true });
projectQuoteSchema.index({ projectId: 1, status: 1, submissionRevision: 1 });
projectQuoteSchema.index({ projectId: 1, submissionRevision: 1, version: -1 });
projectQuoteSchema.index({ professionalUserId: 1, status: 1, updatedAt: -1 });

const ProjectQuote: Model<IProjectQuote> =
  mongoose.models.ProjectQuote ??
  mongoose.model<IProjectQuote>("ProjectQuote", projectQuoteSchema);

export default ProjectQuote;
