import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IWishlistItem extends Document {
  userId: Types.ObjectId;
  productSlug: string;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productSlug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true },
);

wishlistItemSchema.index({ userId: 1, productSlug: 1 }, { unique: true });

const WishlistItem: Model<IWishlistItem> =
  mongoose.models.WishlistItem ??
  mongoose.model<IWishlistItem>("WishlistItem", wishlistItemSchema);

export default WishlistItem;
