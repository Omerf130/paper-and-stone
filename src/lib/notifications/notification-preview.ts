const BODY_PREVIEW_MAX = 200;

export function buildBodyPreview(message?: string): string | undefined {
  const trimmed = message?.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length <= BODY_PREVIEW_MAX) {
    return trimmed;
  }

  return `${trimmed.slice(0, BODY_PREVIEW_MAX - 1)}…`;
}
