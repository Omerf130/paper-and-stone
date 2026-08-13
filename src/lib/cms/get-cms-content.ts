import { connectDB } from "@/lib/db/mongoose";
import {
  DEFAULT_CATALOG_PAGE_CONTENT,
  DEFAULT_HOMEPAGE_CONTENT,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/cms/cms-defaults";
import { mergeWithDefaults } from "@/lib/cms/merge-cms-content";
import {
  mapCatalogPageContentToView,
  mapHomepageContentToView,
  mapSiteSettingsToView,
} from "@/lib/cms/map-cms-to-view";
import CatalogPageContent from "@/models/CatalogPageContent";
import HomepageContent from "@/models/HomepageContent";
import SiteSettings from "@/models/SiteSettings";
import {
  CMS_SINGLETON_KEYS,
  type CatalogPageContentView,
  type HomepageContentView,
  type SiteSettingsView,
} from "@/types/cms-content";

export async function getSiteSettings(): Promise<SiteSettingsView> {
  await connectDB();

  const document = await SiteSettings.findOne({
    key: CMS_SINGLETON_KEYS.site,
  }).lean();

  if (!document) {
    return structuredClone(DEFAULT_SITE_SETTINGS);
  }

  const merged = mergeWithDefaults(
    DEFAULT_SITE_SETTINGS,
    mapSiteSettingsToView(document),
  );

  return merged;
}

export async function getHomepageContent(): Promise<HomepageContentView> {
  await connectDB();

  const document = await HomepageContent.findOne({
    key: CMS_SINGLETON_KEYS.homepage,
  }).lean();

  if (!document) {
    return structuredClone(DEFAULT_HOMEPAGE_CONTENT);
  }

  const merged = mergeWithDefaults(
    DEFAULT_HOMEPAGE_CONTENT,
    mapHomepageContentToView(document),
  );

  return merged;
}

export async function getCatalogPageContent(): Promise<CatalogPageContentView> {
  await connectDB();

  const document = await CatalogPageContent.findOne({
    key: CMS_SINGLETON_KEYS.catalog,
  }).lean();

  if (!document) {
    return structuredClone(DEFAULT_CATALOG_PAGE_CONTENT);
  }

  const merged = mergeWithDefaults(
    DEFAULT_CATALOG_PAGE_CONTENT,
    mapCatalogPageContentToView(document),
  );

  return merged;
}
