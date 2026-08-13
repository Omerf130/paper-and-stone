import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from "@/types/notification";

export interface INotification extends Document {
  recipientUserId: Types.ObjectId;
  type: NotificationType;
  projectId: Types.ObjectId;
  reviewHistoryId?: Types.ObjectId;
  messageId?: Types.ObjectId;
  quoteId?: Types.ObjectId;
  projectNameSnapshot: string;
  bodyPreview?: string;
  idempotencyKey: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    reviewHistoryId: { type: Schema.Types.ObjectId },
    messageId: { type: Schema.Types.ObjectId, ref: "ProjectMessage" },
    quoteId: { type: Schema.Types.ObjectId, ref: "ProjectQuote" },
    projectNameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    bodyPreview: { type: String, trim: true },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
    },
    isRead: { type: Boolean, default: false, required: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
