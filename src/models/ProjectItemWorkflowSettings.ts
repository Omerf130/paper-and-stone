import mongoose, { Schema, type Document, type Model } from "mongoose";
import { PROJECT_ITEM_WORKFLOW_SETTINGS_KEY } from "@/lib/project-items/project-item-workflow-defaults";
import {
  PROJECT_ITEM_STATUSES,
  type ProjectItemWorkflowTransition,
} from "@/types/project-item-status";

export interface IProjectItemWorkflowSettings extends Document {
  key: typeof PROJECT_ITEM_WORKFLOW_SETTINGS_KEY;
  schemaVersion: number;
  transitions: ProjectItemWorkflowTransition[];
  createdAt: Date;
  updatedAt: Date;
}

const workflowTransitionSchema = new Schema<ProjectItemWorkflowTransition>(
  {
    from: {
      type: String,
      enum: PROJECT_ITEM_STATUSES,
      required: true,
    },
    to: {
      type: String,
      enum: PROJECT_ITEM_STATUSES,
      required: true,
    },
    allowedRoles: {
      type: [String],
      enum: ["architect", "client"],
      default: [],
    },
  },
  { _id: false },
);

const projectItemWorkflowSettingsSchema = new Schema<IProjectItemWorkflowSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      enum: [PROJECT_ITEM_WORKFLOW_SETTINGS_KEY],
      default: PROJECT_ITEM_WORKFLOW_SETTINGS_KEY,
    },
    schemaVersion: { type: Number, default: 1, min: 1 },
    transitions: {
      type: [workflowTransitionSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const ProjectItemWorkflowSettings: Model<IProjectItemWorkflowSettings> =
  mongoose.models.ProjectItemWorkflowSettings ??
  mongoose.model<IProjectItemWorkflowSettings>(
    "ProjectItemWorkflowSettings",
    projectItemWorkflowSettingsSchema,
  );

export default ProjectItemWorkflowSettings;
