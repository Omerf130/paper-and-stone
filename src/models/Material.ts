import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { MATERIAL_TYPES, type MaterialType } from "@/types/material";

export interface IMaterial extends Document {
  nameHe: string;
  nameEn?: string;
  code?: string;
  type: MaterialType;
  colorIds: Types.ObjectId[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema<IMaterial>(
  {
    nameHe: { type: String, required: true },
    nameEn: { type: String },
    code: { type: String, unique: true, sparse: true },
    type: {
      type: String,
      enum: MATERIAL_TYPES,
      required: true,
    },
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
