import { revalidatePath, revalidateTag } from "next/cache";

export const HOMEPAGE_CONTENT_CACHE_TAG = "homepage-content";

export async function revalidateHomepagePaths(): Promise<void> {
  revalidateTag(HOMEPAGE_CONTENT_CACHE_TAG, { expire: 0 });
  revalidatePath("/admin/content/homepage");
  revalidatePath("/");
}
