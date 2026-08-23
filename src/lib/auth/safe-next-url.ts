export function resolveSafeNextUrl(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  return trimmed;
}

export function buildLoginHref(nextPath: string): string {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export function buildRegisterHref(nextPath: string): string {
  return `/register?next=${encodeURIComponent(nextPath)}`;
}
