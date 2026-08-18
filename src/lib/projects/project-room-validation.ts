import { z } from "zod";
import {
  PROJECT_ROOM_ERRORS,
  PROJECT_ROOM_NAME_MAX_LENGTH,
} from "@/types/project-room";

export const projectRoomNameSchema = z
  .string()
  .trim()
  .min(1, PROJECT_ROOM_ERRORS.NAME_REQUIRED)
  .max(PROJECT_ROOM_NAME_MAX_LENGTH, PROJECT_ROOM_ERRORS.NAME_TOO_LONG);

export function parseProjectRoomName(
  name: string,
):
  | { success: true; data: string }
  | { success: false; error: string } {
  const parsed = projectRoomNameSchema.safeParse(name);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? PROJECT_ROOM_ERRORS.NAME_REQUIRED,
    };
  }

  return { success: true, data: parsed.data };
}

export function parseProjectRoomReorderIds(
  roomIds: string[],
):
  | { success: true; data: string[] }
  | { success: false; error: string } {
  const uniqueIds = new Set(roomIds);

  if (roomIds.length === 0 || uniqueIds.size !== roomIds.length) {
    return { success: false, error: PROJECT_ROOM_ERRORS.INVALID_REORDER };
  }

  for (const roomId of roomIds) {
    if (!/^[a-f0-9]{24}$/i.test(roomId)) {
      return { success: false, error: PROJECT_ROOM_ERRORS.INVALID_REORDER };
    }
  }

  return { success: true, data: roomIds };
}
