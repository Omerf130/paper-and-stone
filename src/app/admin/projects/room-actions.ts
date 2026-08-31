"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorization";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  createProjectRoomAsAdmin,
  deleteProjectRoomAsAdmin,
  getProjectRoomsForAdminPicker,
  moveProjectItemToRoomAsAdmin,
  renameProjectRoomAsAdmin,
} from "@/lib/projects/project-admin-room-mutations";
import type { ProjectFormState } from "@/types/project";

export async function createProjectRoomAsAdminAction(
  projectId: string,
  name: string,
): Promise<ProjectFormState & { roomId?: string }> {
  const user = await requireAdmin();

  try {
    const roomId = await createProjectRoomAsAdmin(user.id, projectId, name);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, roomId };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה ביצירת החדר." };
  }
}

export async function renameProjectRoomAsAdminAction(
  projectId: string,
  roomId: string,
  name: string,
): Promise<ProjectFormState> {
  await requireAdmin();

  try {
    await renameProjectRoomAsAdmin(projectId, roomId, name);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בעדכון החדר." };
  }
}

export async function deleteProjectRoomAsAdminAction(
  projectId: string,
  roomId: string,
): Promise<ProjectFormState> {
  await requireAdmin();

  try {
    await deleteProjectRoomAsAdmin(projectId, roomId);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה במחיקת החדר." };
  }
}

export async function moveProjectItemToRoomAsAdminAction(
  projectId: string,
  itemId: string,
  targetRoomId?: string | null,
): Promise<ProjectFormState> {
  await requireAdmin();

  try {
    await moveProjectItemToRoomAsAdmin(projectId, itemId, targetRoomId);
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בהעברת המוצר." };
  }
}

export async function getProjectRoomsForAdminPickerAction(
  projectId: string,
): Promise<{ rooms: Array<{ id: string; name: string }>; error?: string }> {
  await requireAdmin();

  try {
    const rooms = await getProjectRoomsForAdminPicker(projectId);
    return { rooms };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { rooms: [], error: error.message };
    }

    return { rooms: [], error: "לא ניתן לטעון חדרים." };
  }
}
