import { connectDB } from "@/lib/db/mongoose";
import { PROJECT_ITEM_WORKFLOW_SETTINGS_KEY } from "@/lib/project-items/project-item-workflow-defaults";
import {
  validateWorkflowTransitions,
} from "@/lib/project-items/project-item-workflow-validation";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import ProjectItemWorkflowSettings from "@/models/ProjectItemWorkflowSettings";
import type { ProjectItemWorkflowSettingsView } from "@/types/project-item-status";

export async function updateProjectItemWorkflowSettings(
  _adminUserId: string,
  settings: ProjectItemWorkflowSettingsView,
): Promise<void> {
  const validation = validateWorkflowTransitions(settings.transitions);

  if (!validation.ok) {
    throw new ProjectMutationError(validation.error);
  }

  await connectDB();

  await ProjectItemWorkflowSettings.findOneAndUpdate(
    { key: PROJECT_ITEM_WORKFLOW_SETTINGS_KEY },
    {
      $set: {
        transitions: settings.transitions,
      },
    },
    {
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
}
