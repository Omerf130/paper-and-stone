import type {
  ProjectItemWorkflowSettingsView,
  ProjectItemWorkflowTransition,
} from "@/types/project-item-status";

export const PROJECT_ITEM_WORKFLOW_SETTINGS_KEY =
  "project-item-workflow" as const;

export const DEFAULT_PROJECT_ITEM_WORKFLOW_TRANSITIONS: ProjectItemWorkflowTransition[] =
  [
    { from: "draft", to: "quoting", allowedRoles: ["architect"] },
    { from: "quoting", to: "selected", allowedRoles: ["architect"] },
    { from: "selected", to: "internal_review", allowedRoles: ["architect"] },
    { from: "resubmit", to: "internal_review", allowedRoles: ["architect"] },
    {
      from: "internal_review",
      to: "client_review",
      allowedRoles: [],
    },
    {
      from: "client_review",
      to: "client_approved",
      allowedRoles: ["client"],
    },
    {
      from: "client_review",
      to: "client_rejected",
      allowedRoles: ["client"],
    },
    { from: "client_rejected", to: "resubmit", allowedRoles: [] },
  ];

export const DEFAULT_PROJECT_ITEM_WORKFLOW_SETTINGS: ProjectItemWorkflowSettingsView =
  {
    transitions: DEFAULT_PROJECT_ITEM_WORKFLOW_TRANSITIONS,
  };
