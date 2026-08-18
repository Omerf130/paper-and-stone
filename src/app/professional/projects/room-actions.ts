"use server";

import { revalidatePath } from "next/cache";
import { requireProfessional } from "@/lib/auth/authorization";
import { ProjectMutationError } from "@/lib/projects/project-errors";
import {
  createProjectRoom,
  deleteProjectRoom,
  moveProjectItemToRoom,
  renameProjectRoom,
  reorderProjectRooms,
} from "@/lib/projects/project-room-mutations";
import type { ProjectFormState } from "@/types/project";

export async function createProjectRoomAction(
  projectId: string,
  name: string,
): Promise<ProjectFormState & { roomId?: string }> {
  const user = await requireProfessional();

  try {
    const roomId = await createProjectRoom(user.id, projectId, name);
    revalidatePath(`/professional/projects/${projectId}`);
    return { success: true, roomId };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה ביצירת החדר." };
  }
}

export async function renameProjectRoomAction(
  projectId: string,
  roomId: string,
  name: string,
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  try {
    await renameProjectRoom(user.id, projectId, roomId, name);
    revalidatePath(`/professional/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בעדכון החדר." };
  }
}

export async function reorderProjectRoomsAction(
  projectId: string,
  roomIds: string[],
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  try {
    await reorderProjectRooms(user.id, projectId, roomIds);
    revalidatePath(`/professional/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בעדכון סדר החדרים." };
  }
}

export async function deleteProjectRoomAction(
  projectId: string,
  roomId: string,
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  try {
    await deleteProjectRoom(user.id, projectId, roomId);
    revalidatePath(`/professional/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה במחיקת החדר." };
  }
}

export async function moveProjectItemToRoomAction(
  projectId: string,
  itemId: string,
  targetRoomId: string,
): Promise<ProjectFormState> {
  const user = await requireProfessional();

  try {
    await moveProjectItemToRoom(user.id, projectId, itemId, targetRoomId);
    revalidatePath(`/professional/projects/${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { error: error.message };
    }

    return { error: "אירעה שגיאה בהעברת המוצר." };
  }
}

export async function getProjectRoomsForPickerAction(
  projectId: string,
): Promise<{ rooms: Array<{ id: string; name: string }>; error?: string }> {
  const user = await requireProfessional();

  try {
    const { getProjectRoomViews } = await import(
      "@/lib/projects/project-room-queries"
    );
    const { verifyProjectPickerAccess } = await import(
      "@/lib/projects/verify-project-picker-access"
    );

    await verifyProjectPickerAccess(user.id, projectId);
    const rooms = await getProjectRoomViews(projectId);

    return {
      rooms: rooms.map((room) => ({ id: room.id, name: room.name })),
    };
  } catch (error: unknown) {
    if (error instanceof ProjectMutationError) {
      return { rooms: [], error: error.message };
    }

    return { rooms: [], error: "לא ניתן לטעון חדרים." };
  }
}
