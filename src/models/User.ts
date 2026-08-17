import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { RequestedRole, StoredUserRole } from "@/types/user";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: StoredUserRole;
  fullName?: string;
  identificationNumber?: string;
  requestedRole?: RequestedRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    fullName: { type: String, trim: true },
    identificationNumber: { type: String, trim: true },
    role: {
      type: String,
      enum: ["client", "architect", "admin", "customer", "professional"],
      required: true,
      default: "client",
    },
    requestedRole: {
      type: String,
      enum: ["architect", null],
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, requestedRole: 1, isActive: 1 });

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);

export default User;
