import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminUser } from "@/lib/auth/authorization";
import { MEDIA_ERRORS } from "@/lib/media/media-validation";

export async function requireAdminForApi(): Promise<
  { ok: true } | { ok: false; status: number; message: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, status: 401, message: MEDIA_ERRORS.UNAUTHORIZED };
  }

  if (!isAdminUser(user)) {
    return { ok: false, status: 403, message: MEDIA_ERRORS.UNAUTHORIZED };
  }

  return { ok: true };
}

export class MediaUploadAuthorizationError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MediaUploadAuthorizationError";
    this.status = status;
  }
}

export async function assertAdminForUpload(): Promise<void> {
  const result = await requireAdminForApi();
  if (!result.ok) {
    throw new MediaUploadAuthorizationError(result.message, result.status);
  }
}
