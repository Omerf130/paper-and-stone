import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import {
  PRODUCT_MEDIA_TYPES,
  type ProductMediaType,
} from "@/types/product-media";

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

export interface IProductMaterialOption {
  materialId: Types.ObjectId;
  allowedColorIds: Types.ObjectId[];
}

export interface IProductMediaItem {
  _id: Types.ObjectId;
  storageKey: string;
  url: string;
  mediaType: ProductMediaType;
  mimeType: string;
  originalFilename: string;
  byteSize: number;
  width?: number;
  height?: number;
  altText?: string;
  sortOrder: number;
  createdAt: Date;
}

export interface IProductMedia {
  primaryImage?: IProductMediaItem;
  gallery: IProductMediaItem[];
  technicalDrawing?: IProductMediaItem;
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
  materialOptions: IProductMaterialOption[];
  sizes: IProductSize[];
  media: IProductMedia;
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

const productMaterialOptionSchema = new Schema<IProductMaterialOption>(
  {
    materialId: {
      type: Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },
    allowedColorIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Color" }],
      default: [],
    },
  },
  { _id: false },
);

const productMediaItemSchema = new Schema<IProductMediaItem>(
  {
    storageKey: { type: String, required: true },
    url: { type: String, required: true },
    mediaType: {
      type: String,
      enum: PRODUCT_MEDIA_TYPES,
      required: true,
    },
    mimeType: { type: String, required: true },
    originalFilename: { type: String, required: true },
    byteSize: { type: Number, required: true, min: 0 },
    width: { type: Number },
    height: { type: Number },
    altText: { type: String },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const productMediaSchema = new Schema<IProductMedia>(
  {
    primaryImage: { type: productMediaItemSchema },
    gallery: { type: [productMediaItemSchema], default: [] },
    technicalDrawing: { type: productMediaItemSchema },
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
    materialOptions: { type: [productMaterialOptionSchema], default: [] },
    sizes: { type: [productSizeSchema], default: [] },
    media: {
      type: productMediaSchema,
      default: () => ({ gallery: [] }),
    },
  },
  { timestamps: true },
);

productSchema.index({ isActive: 1, slug: 1 });
productSchema.index({ isActive: 1, categoryId: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", productSchema);

export default Product;
