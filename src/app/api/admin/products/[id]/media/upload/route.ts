import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getProductSlug } from "@/lib/media/getAdminProductMediaById";
import {
  applyUploadWithReplace,
  ProductMediaMutationError,
} from "@/lib/media/product-media-mutations";
import { revalidateProductMediaPaths } from "@/lib/media/revalidate-product-media-paths";
import {
  MediaUploadAuthorizationError,
} from "@/lib/media/require-admin-for-api";
import { validateUploadTokenRequest } from "@/lib/media/upload-token-validation";
import type { MediaUploadTokenPayload } from "@/types/admin-product-media";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function parseTokenPayload(
  raw: string | null | undefined,
): MediaUploadTokenPayload | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MediaUploadTokenPayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id: productId } = await context.params;

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
        return validateUploadTokenRequest(
          productId,
          pathname,
          clientPayload,
          callbackUrl,
        );
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = parseTokenPayload(tokenPayload);
        if (!payload || payload.productId !== productId) {
          throw new Error("Invalid upload token payload.");
        }

        const originalFilename =
          blob.pathname.split("/").pop()?.replace(/^[^-]+-/, "") ?? "file";

        await applyUploadWithReplace({
          productId,
          slot: payload.slot,
          altText: payload.altText,
          blob: {
            pathname: blob.pathname,
            url: blob.url,
            contentType: blob.contentType,
          },
          originalFilename,
          byteSize: 0,
        });

        const slug = await getProductSlug(productId);
        await revalidateProductMediaPaths(slug);
      },
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof MediaUploadAuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof ProductMediaMutationError) {
      return jsonError(error.message, 400);
    }

    console.error("[media upload]", error);
    return jsonError("אירעה שגיאה בהעלאת הקובץ.", 500);
  }
}
