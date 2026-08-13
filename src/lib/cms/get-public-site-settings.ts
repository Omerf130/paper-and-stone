import { unstable_cache } from "next/cache";
import { getSiteSettings } from "@/lib/cms/get-cms-content";
import { SITE_SETTINGS_CACHE_TAG } from "@/lib/cms/revalidate-site-settings-paths";
import type { SiteSettingsView } from "@/types/cms-content";

export async function getPublicSiteSettings(): Promise<SiteSettingsView> {
  return unstable_cache(
    async () => getSiteSettings(),
    [SITE_SETTINGS_CACHE_TAG],
    { tags: [SITE_SETTINGS_CACHE_TAG] },
  )();
}
