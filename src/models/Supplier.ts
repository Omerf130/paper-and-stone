import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  code?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

const Supplier: Model<ISupplier> =
  mongoose.models.Supplier ??
  mongoose.model<ISupplier>("Supplier", supplierSchema);

export default Supplier;
