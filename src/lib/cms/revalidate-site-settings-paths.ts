import { revalidatePath, revalidateTag } from "next/cache";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

export async function revalidateSiteSettingsPaths(): Promise<void> {
  revalidateTag(SITE_SETTINGS_CACHE_TAG, { expire: 0 });
  revalidatePath("/admin/content/site");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/login");
  revalidatePath("/register");
}
