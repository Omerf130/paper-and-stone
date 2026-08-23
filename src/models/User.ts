import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { RequestedRole, StoredUserRole } from "@/types/user";
import type { AccountStatus } from "@/lib/users/account-status";
import { ACCOUNT_STATUSES } from "@/lib/users/account-status";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: StoredUserRole;
  fullName?: string;
  identificationNumber?: string;
  requestedRole?: RequestedRole;
  accountStatus?: AccountStatus;
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
    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUSES,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, requestedRole: 1, isActive: 1 });
userSchema.index({ role: 1, accountStatus: 1, requestedRole: 1, createdAt: -1 });

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);

export default User;
