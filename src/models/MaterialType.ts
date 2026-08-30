import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IMaterialType extends Document {
  key: string;
  labelEn: string;
  isBuiltIn: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const materialTypeSchema = new Schema<IMaterialType>(
  {
    key: { type: String, required: true, unique: true, index: true },
    labelEn: { type: String, required: true },
    isBuiltIn: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

materialTypeSchema.index({ isActive: 1, sortOrder: 1 });

const MaterialType: Model<IMaterialType> =
  mongoose.models.MaterialType ??
  mongoose.model<IMaterialType>("MaterialType", materialTypeSchema);

export default MaterialType;
