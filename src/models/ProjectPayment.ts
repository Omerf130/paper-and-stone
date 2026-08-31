import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import {
  PROJECT_PAYMENT_METHODS,
  type ProjectPaymentMethod,
} from "@/types/project-payment";

export interface IProjectPayment extends Document {
  projectId: Types.ObjectId;
  amountAgorot: number;
  paymentDate: Date;
  paymentMethod: ProjectPaymentMethod;
  note?: string;
  createdByAdminUserId: Types.ObjectId;
  updatedByAdminUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectPaymentSchema = new Schema<IProjectPayment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    amountAgorot: { type: Number, required: true, min: 1 },
    paymentDate: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: PROJECT_PAYMENT_METHODS,
      required: true,
    },
    note: { type: String, trim: true, maxlength: 500 },
    createdByAdminUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedByAdminUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

projectPaymentSchema.index({ projectId: 1, paymentDate: -1 });

const ProjectPayment: Model<IProjectPayment> =
  mongoose.models.ProjectPayment ??
  mongoose.model<IProjectPayment>("ProjectPayment", projectPaymentSchema);

export default ProjectPayment;
