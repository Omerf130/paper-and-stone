import { randomUUID } from "crypto";
import { sanitizeFilename } from "@/lib/media/sanitize-filename";
import {
  CMS_MEDIA_SCOPES,
  cmsMediaScopeRequiresItemId,
  isKnownCmsMediaScope,
  parseCmsMediaScope,
  type CmsMediaScope,
  type CmsMediaScopeOptions,
} from "@/lib/cms/cms-media-scope";

export function buildCmsStoragePath(
  mediaScope: string,
  originalFilename: string,
  options?: CmsMediaScopeOptions,
): string {
  const parsed = parseCmsMediaScope(mediaScope);
  if (!parsed) {
    throw new Error("Invalid CMS media scope.");
  }

  const safeFilename = sanitizeFilename(originalFilename);
  const uniqueId = randomUUID();

  if (
    isKnownCmsMediaScope(mediaScope) &&
    cmsMediaScopeRequiresItemId(mediaScope)
  ) {
    const itemId = options?.itemId?.trim();
    if (!itemId) {
      throw new Error("Item ID is required for this CMS media scope.");
    }

    if (mediaScope === CMS_MEDIA_SCOPES.homepageCategory) {
      return `cms/homepage/categories/${itemId}/${uniqueId}-${safeFilename}`;
    }

    if (mediaScope === CMS_MEDIA_SCOPES.homepageInspiration) {
      return `cms/homepage/inspiration/${itemId}/${uniqueId}-${safeFilename}`;
    }
  }

  return `cms/${parsed.scope}/${parsed.field}/${uniqueId}-${safeFilename}`;
}

export function isPathnameInCmsScope(
  pathname: string,
  mediaScope: string,
  options?: CmsMediaScopeOptions,
): boolean {
  const parsed = parseCmsMediaScope(mediaScope);
  if (!parsed) {
    return false;
  }

  if (pathname.includes("..") || pathname.includes("//")) {
    return false;
  }

  if (
    isKnownCmsMediaScope(mediaScope) &&
    cmsMediaScopeRequiresItemId(mediaScope)
  ) {
    const itemId = options?.itemId?.trim();
    if (!itemId) {
      return false;
    }

    if (mediaScope === CMS_MEDIA_SCOPES.homepageCategory) {
      return pathname.startsWith(`cms/homepage/categories/${itemId}/`);
    }

    if (mediaScope === CMS_MEDIA_SCOPES.homepageInspiration) {
      return pathname.startsWith(`cms/homepage/inspiration/${itemId}/`);
    }
  }

  const expectedPrefix = `cms/${parsed.scope}/${parsed.field}/`;
  return pathname.startsWith(expectedPrefix);
}

export function assertPathnameMatchesScope(
  pathname: string,
  mediaScope: CmsMediaScope,
  options?: CmsMediaScopeOptions,
): void {
  if (!isPathnameInCmsScope(pathname, mediaScope, options)) {
    throw new Error("Invalid CMS media pathname.");
  }
}
