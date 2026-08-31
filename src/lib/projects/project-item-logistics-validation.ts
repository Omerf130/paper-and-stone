import { z } from "zod";
import {
  PROJECT_ITEM_LOGISTICS_ERRORS,
  PROJECT_ITEM_LOGISTICS_NOTE_MAX_LENGTH,
  PROJECT_ITEM_LOGISTICS_STATUSES,
  type ProjectItemLogisticsStatus,
  type UpdateProjectItemLogisticsInput,
} from "@/types/project-item-logistics";

const logisticsUpdateSchema = z.object({
  projectId: z.string().min(1),
  itemId: z.string().min(1),
  status: z.enum(PROJECT_ITEM_LOGISTICS_STATUSES, {
    message: PROJECT_ITEM_LOGISTICS_ERRORS.STATUS_INVALID,
  }),
  note: z
    .string()
    .trim()
    .max(
      PROJECT_ITEM_LOGISTICS_NOTE_MAX_LENGTH,
      PROJECT_ITEM_LOGISTICS_ERRORS.NOTE_TOO_LONG,
    )
    .optional()
    .or(z.literal("")),
});

export function parseProjectItemLogisticsUpdateInput(
  input: UpdateProjectItemLogisticsInput,
):
  | {
      success: true;
      data: {
        projectId: string;
        itemId: string;
        status: ProjectItemLogisticsStatus;
        note?: string;
      };
    }
  | { success: false; error: string } {
  const parsed = logisticsUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? PROJECT_ITEM_LOGISTICS_ERRORS.STATUS_INVALID,
    };
  }

  const note = parsed.data.note?.trim();

  return {
    success: true,
    data: {
      projectId: parsed.data.projectId,
      itemId: parsed.data.itemId,
      status: parsed.data.status,
      note: note || undefined,
    },
  };
}
