import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import type {
  ProjectConversationType,
  ProjectMessageAudience,
  ProjectMessageSenderRole,
} from "@/types/project-message";

export interface IProjectMessage extends Document {
  projectId: Types.ObjectId;
  senderUserId: Types.ObjectId;
  senderRole: ProjectMessageSenderRole;
  audience: ProjectMessageAudience;
  conversationType?: ProjectConversationType | null;
  clientUserIdAtSend?: Types.ObjectId | null;
  body: string;
  readByUserIds: Types.ObjectId[];
  createdAt: Date;
}

const projectMessageSchema = new Schema<IProjectMessage>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    senderUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["professional", "admin", "architect", "client"],
      required: true,
    },
    audience: {
      type: String,
      enum: ["professional", "admin", "architect", "client"],
      required: true,
    },
    conversationType: {
      type: String,
      enum: ["admin_architect", "architect_client"],
      default: null,
    },
    clientUserIdAtSend: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    readByUserIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

projectMessageSchema.index({ projectId: 1, createdAt: -1 });
projectMessageSchema.index({
  projectId: 1,
  conversationType: 1,
  clientUserIdAtSend: 1,
  createdAt: -1,
});

const ProjectMessage: Model<IProjectMessage> =
  mongoose.models.ProjectMessage ??
  mongoose.model<IProjectMessage>("ProjectMessage", projectMessageSchema);

export default ProjectMessage;
