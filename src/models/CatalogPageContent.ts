import mongoose, { Schema, type Document, type Model } from "mongoose";
import { CMS_LIMITS, CMS_SCHEMA_VERSION } from "@/lib/cms/cms-constants";
import { CMS_SINGLETON_KEYS } from "@/types/cms-content";

export interface ICatalogPageContent extends Document {
  key: typeof CMS_SINGLETON_KEYS.catalog;
  schemaVersion: number;
  eyebrow: string;
  heading: string;
  supportingText: string;
  createdAt: Date;
  updatedAt: Date;
}

const catalogPageContentSchema = new Schema<ICatalogPageContent>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      enum: [CMS_SINGLETON_KEYS.catalog],
      default: CMS_SINGLETON_KEYS.catalog,
    },
    schemaVersion: { type: Number, default: CMS_SCHEMA_VERSION, min: 1 },
    eyebrow: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.eyebrow,
    },
    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.heading,
    },
    supportingText: {
      type: String,
      required: true,
      trim: true,
      maxlength: CMS_LIMITS.supportingText,
    },
  },
  { timestamps: true },
);

const CatalogPageContent: Model<ICatalogPageContent> =
  mongoose.models.CatalogPageContent ??
  mongoose.model<ICatalogPageContent>("CatalogPageContent", catalogPageContentSchema);

export default CatalogPageContent;
