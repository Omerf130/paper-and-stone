import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICategory extends Document {
  nameHe: string;
  nameEn?: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    nameHe: { type: String, required: true },
    nameEn: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Category: Model<ICategory> =
  mongoose.models.Category ??
  mongoose.model<ICategory>("Category", categorySchema);

export default Category;
