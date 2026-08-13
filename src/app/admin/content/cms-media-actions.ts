"use server";

import { requireAdmin } from "@/lib/auth/authorization";
import {
  assertPathnameMatchesScope,
  buildCmsStoragePath,
} from "@/lib/cms/build-cms-storage-path";
import {
  applyHomepageMediaRemove,
  applyHomepageMediaUpload,
  applySiteLogoRemove,
  applySiteLogoUploadIdempotent,
  assertWritableCmsMediaScope,
  CmsMediaMutationError,
} from "@/lib/cms/cms-media-mutations";
import { CMS_MEDIA_SCOPES, cmsMediaScopeRequiresItemId } from "@/lib/cms/cms-media-scope";
import { CMS_MEDIA_ERRORS } from "@/lib/cms/cms-media-validation";
import { revalidateHomepagePaths } from "@/lib/cms/revalidate-homepage-paths";
import { revalidateSiteSettingsPaths } from "@/lib/cms/revalidate-site-settings-paths";
import type { CmsMediaScope } from "@/lib/cms/cms-media-scope";

export type CmsMediaActionState = {
  error?: string;
  success?: boolean;
};

async function revalidateForScope(mediaScope: CmsMediaScope): Promise<void> {
  if (mediaScope === CMS_MEDIA_SCOPES.siteLogo) {
    await revalidateSiteSettingsPaths();
    return;
  }

  await revalidateHomepagePaths();
}

export async function prepareCmsImageUploadAction(
  mediaScope: CmsMediaScope,
  originalFilename: string,
  alt?: string,
  itemId?: string,
): Promise<{ error: string } | { pathname: string; clientPayload: string }> {
  await requireAdmin();

  try {
    assertWritableCmsMediaScope(mediaScope);

    if (cmsMediaScopeRequiresItemId(mediaScope) && !itemId) {
      return { error: CMS_MEDIA_ERRORS.INVALID_PAYLOAD };
    }

    const pathname = buildCmsStoragePath(mediaScope, originalFilename, { itemId });
    const clientPayload = JSON.stringify({
      mediaScope,
      alt: alt?.trim() || undefined,
      itemId,
    });

    return { pathname, clientPayload };
  } catch (error) {
    if (error instanceof CmsMediaMutationError) {
      return { error: error.message };
    }

    return { error: CMS_MEDIA_ERRORS.GENERIC };
  }
}

export async function finalizeCmsImageUploadAction(input: {
  mediaScope: CmsMediaScope;
  pathname: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  itemId?: string;
  isDecorative?: boolean;
}): Promise<CmsMediaActionState> {
  await requireAdmin();

  try {
    assertWritableCmsMediaScope(input.mediaScope);

    if (cmsMediaScopeRequiresItemId(input.mediaScope) && !input.itemId) {
      return { error: CMS_MEDIA_ERRORS.INVALID_PAYLOAD };
    }

    assertPathnameMatchesScope(input.pathname, input.mediaScope, {
      itemId: input.itemId,
    });

    const image = {
      url: input.url,
      storageKey: input.pathname,
      alt: input.alt,
      isDecorative: input.isDecorative,
      width: input.width,
      height: input.height,
    };

    if (input.mediaScope === CMS_MEDIA_SCOPES.siteLogo) {
      await applySiteLogoUploadIdempotent(image);
    } else {
      await applyHomepageMediaUpload({
        mediaScope: input.mediaScope,
        itemId: input.itemId,
        image,
      });
    }

    await revalidateForScope(input.mediaScope);
    return { success: true };
  } catch (error) {
    if (error instanceof CmsMediaMutationError) {
      return { error: error.message };
    }

    return { error: CMS_MEDIA_ERRORS.GENERIC };
  }
}

export async function removeCmsImageAction(input: {
  mediaScope: CmsMediaScope;
  itemId?: string;
}): Promise<CmsMediaActionState> {
  await requireAdmin();

  try {
    assertWritableCmsMediaScope(input.mediaScope);

    if (cmsMediaScopeRequiresItemId(input.mediaScope) && !input.itemId) {
      return { error: CMS_MEDIA_ERRORS.INVALID_PAYLOAD };
    }

    if (input.mediaScope === CMS_MEDIA_SCOPES.siteLogo) {
      await applySiteLogoRemove();
    } else {
      await applyHomepageMediaRemove({
        mediaScope: input.mediaScope,
        itemId: input.itemId,
      });
    }

    await revalidateForScope(input.mediaScope);
    return { success: true };
  } catch (error) {
    if (error instanceof CmsMediaMutationError) {
      return { error: error.message };
    }

    return { error: CMS_MEDIA_ERRORS.GENERIC };
  }
}
