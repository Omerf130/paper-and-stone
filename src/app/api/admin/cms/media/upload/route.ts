import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import {
  applyHomepageMediaUpload,
  applySiteLogoUploadWithReplace,
  CmsMediaMutationError,
} from "@/lib/cms/cms-media-mutations";
import { CMS_MEDIA_SCOPES } from "@/lib/cms/cms-media-scope";
import { revalidateHomepagePaths } from "@/lib/cms/revalidate-homepage-paths";
import { revalidateSiteSettingsPaths } from "@/lib/cms/revalidate-site-settings-paths";
import type { CmsMediaUploadTokenPayload } from "@/lib/cms/cms-upload-token-validation";
import { validateCmsUploadTokenRequest } from "@/lib/cms/cms-upload-token-validation";
import { MediaUploadAuthorizationError } from "@/lib/media/require-admin-for-api";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function parseTokenPayload(
  raw: string | null | undefined,
): CmsMediaUploadTokenPayload | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CmsMediaUploadTokenPayload;
  } catch {
    return null;
  }
}

async function persistUploadedImage(
  payload: CmsMediaUploadTokenPayload,
  blob: { url: string; pathname: string },
): Promise<void> {
  const image = {
    url: blob.url,
    storageKey: blob.pathname,
    alt: payload.alt,
  };

  if (payload.mediaScope === CMS_MEDIA_SCOPES.siteLogo) {
    await applySiteLogoUploadWithReplace(image);
    await revalidateSiteSettingsPaths();
    return;
  }

  await applyHomepageMediaUpload({
    mediaScope: payload.mediaScope as typeof CMS_MEDIA_SCOPES.homepageHero,
    itemId: payload.itemId,
    image,
  });
  await revalidateHomepagePaths();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("בקשה לא תקינה.", 400);
  }

  const callbackUrl = new URL(request.url).href;

  try {
    const result = await handleUpload({
      request,
      body: body as Parameters<typeof handleUpload>[0]["body"],
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return validateCmsUploadTokenRequest(pathname, clientPayload, callbackUrl);
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = parseTokenPayload(tokenPayload);
        if (!payload) {
          throw new Error("Invalid upload token payload.");
        }

        await persistUploadedImage(payload, blob);
      },
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof MediaUploadAuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof CmsMediaMutationError) {
      return jsonError(error.message, 400);
    }

    console.error("[cms media upload]", error);
    return jsonError("אירעה שגיאה בהעלאת הקובץ.", 500);
  }
}
