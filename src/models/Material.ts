import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import type { MaterialSwatchImage } from "@/types/material-variant";

export interface IMaterialVariant {
  _id: Types.ObjectId;
  name: string;
  hex?: string;
  swatchImage?: MaterialSwatchImage;
  isActive: boolean;
}

export interface IMaterial extends Document {
  nameHe?: string;
  nameEn: string;
  code?: string;
  type: string;
  variants: IMaterialVariant[];
  /** @deprecated Synced from variant IDs for backward compatibility */
  colorIds: Types.ObjectId[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const materialSwatchImageSchema = new Schema<MaterialSwatchImage>(
  {
    storageKey: { type: String, required: true },
    url: { type: String, required: true },
    alt: { type: String },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false },
);

const materialVariantSchema = new Schema<IMaterialVariant>(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String },
    swatchImage: { type: materialSwatchImageSchema },
    isActive: { type: Boolean, default: true },
  },
  { _id: true },
);

const materialSchema = new Schema<IMaterial>(
  {
    nameHe: { type: String },
    nameEn: { type: String, required: true },
    code: { type: String, unique: true, sparse: true },
    type: { type: String, required: true, index: true },
    variants: { type: [materialVariantSchema], default: [] },
    colorIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Color" }],
      default: [],
    },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

materialSchema.index({ isActive: 1, sortOrder: 1 });
materialSchema.index({ type: 1, isActive: 1 });

const Material: Model<IMaterial> =
  mongoose.models.Material ??
  mongoose.model<IMaterial>("Material", materialSchema);

export default Material;
