import { revalidatePath } from "next/cache";

export function revalidateProfessionalNotificationSurfaces(): void {
  revalidatePath("/professional/notifications");
  revalidatePath("/professional");
}
