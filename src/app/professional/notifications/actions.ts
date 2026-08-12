"use server";

import { requireProfessional } from "@/lib/auth/authorization";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/notification-queries";
import { revalidateProfessionalNotificationSurfaces } from "@/lib/notifications/revalidate-professional-notification-surfaces";
import type { NotificationActionState } from "@/types/notification";

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const user = await requireProfessional();

  try {
    const updated = await markNotificationRead(user.id, notificationId);
    if (!updated) {
      return { error: "ההתראה לא נמצאה." };
    }

    revalidateProfessionalNotificationSurfaces();
    return { success: true };
  } catch {
    return { error: "אירעה שגיאה בעדכון ההתראה." };
  }
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionState> {
  const user = await requireProfessional();

  try {
    await markAllNotificationsRead(user.id);
    revalidateProfessionalNotificationSurfaces();
    return { success: true };
  } catch {
    return { error: "אירעה שגיאה בעדכון ההתראות." };
  }
}
