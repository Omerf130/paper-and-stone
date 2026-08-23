import { connectDB } from "@/lib/db/mongoose";
import {
  DEFAULT_PROJECT_ITEM_WORKFLOW_SETTINGS,
  PROJECT_ITEM_WORKFLOW_SETTINGS_KEY,
} from "@/lib/project-items/project-item-workflow-defaults";
import ProjectItemWorkflowSettings from "@/models/ProjectItemWorkflowSettings";
import type { ProjectItemWorkflowSettingsView } from "@/types/project-item-status";

function mapDocumentToView(
  document: Pick<{ transitions: ProjectItemWorkflowSettingsView["transitions"] }, "transitions">,
): ProjectItemWorkflowSettingsView {
  return {
    transitions: document.transitions.map((transition) => ({
      from: transition.from,
      to: transition.to,
      allowedRoles: [...transition.allowedRoles],
    })),
  };
}

export async function getProjectItemWorkflowSettings(): Promise<ProjectItemWorkflowSettingsView> {
  await connectDB();

  const document = await ProjectItemWorkflowSettings.findOne({
    key: PROJECT_ITEM_WORKFLOW_SETTINGS_KEY,
  }).lean();

  if (!document || document.transitions.length === 0) {
    return structuredClone(DEFAULT_PROJECT_ITEM_WORKFLOW_SETTINGS);
  }

  return mapDocumentToView(document);
}
