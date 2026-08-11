import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IColor extends Document {
  nameHe: string;
  nameEn?: string;
  code?: string;
  hex: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const colorSchema = new Schema<IColor>(
  {
    nameHe: { type: String, required: true },
    nameEn: { type: String },
    code: { type: String, unique: true, sparse: true },
    hex: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

colorSchema.index({ isActive: 1, sortOrder: 1 });

const Color: Model<IColor> =
  mongoose.models.Color ?? mongoose.model<IColor>("Color", colorSchema);

export default Color;
