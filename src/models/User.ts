import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { UserRole } from "@/types/user";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
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
    role: {
      type: String,
      enum: ["customer", "professional", "admin"],
      required: true,
      default: "customer",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);

export default User;
