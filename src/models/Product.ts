import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IProductColor {
  key: string;
  label: string;
  visualTone?: string;
}

export interface IProductFabric {
  key: string;
  label: string;
  colors: IProductColor[];
}

export interface IProductSize {
  key: string;
  label: string;
}

export interface IProduct extends Document {
  nameHe: string;
  nameEn?: string;
  slug: string;
  sku: string;
  categoryId: Types.ObjectId;
  brand?: string;
  designer?: string;
  shortDescription?: string;
  longDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  width?: number;
  depth?: number;
  height?: number;
  seatHeight?: number;
  materials: string[];
  maintenance?: string;
  warranty?: string;
  countryOfOrigin?: string;
  fabrics: IProductFabric[];
  sizes: IProductSize[];
  createdAt: Date;
  updatedAt: Date;
}

const productColorSchema = new Schema<IProductColor>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    visualTone: { type: String },
  },
  { _id: false },
);

const productFabricSchema = new Schema<IProductFabric>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    colors: { type: [productColorSchema], default: [] },
  },
  { _id: false },
);

const productSizeSchema = new Schema<IProductSize>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    nameHe: { type: String, required: true },
    nameEn: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    brand: { type: String },
    designer: { type: String },
    shortDescription: { type: String },
    longDescription: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    width: { type: Number },
    depth: { type: Number },
    height: { type: Number },
    seatHeight: { type: Number },
    materials: { type: [String], default: [] },
    maintenance: { type: String },
    warranty: { type: String },
    countryOfOrigin: { type: String },
    fabrics: { type: [productFabricSchema], default: [] },
    sizes: { type: [productSizeSchema], default: [] },
  },
  { timestamps: true },
);

productSchema.index({ isActive: 1, slug: 1 });
productSchema.index({ isActive: 1, categoryId: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", productSchema);

export default Product;
