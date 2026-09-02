import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import {
  CATEGORY_KINDS,
  type CategoryKind,
} from "@/types/category-kind";

export interface ICategory extends Document {
  nameHe: string;
  nameEn?: string;
  slug: string;
  kind: CategoryKind;
  parentId?: Types.ObjectId;
  taxonomyKey?: string;
  descriptionHe?: string;
  descriptionEn?: string;
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
    kind: {
      type: String,
      enum: CATEGORY_KINDS,
      required: true,
      default: "leaf",
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    taxonomyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    descriptionHe: { type: String },
    descriptionEn: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Category: Model<ICategory> =
  mongoose.models.Category ??
  mongoose.model<ICategory>("Category", categorySchema);

export default Category;
