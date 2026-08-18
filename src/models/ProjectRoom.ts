import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IProjectRoom extends Document {
  projectId: Types.ObjectId;
  name: string;
  order: number;
  createdByUserId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectRoomSchema = new Schema<IProjectRoom>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    order: { type: Number, required: true, min: 0 },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

projectRoomSchema.index({ projectId: 1, order: 1 });

const ProjectRoom: Model<IProjectRoom> =
  mongoose.models.ProjectRoom ??
  mongoose.model<IProjectRoom>("ProjectRoom", projectRoomSchema);

export default ProjectRoom;
