export function isDuplicateCodeError(error: unknown): boolean {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000 &&
    "keyPattern" in error &&
    typeof error.keyPattern === "object" &&
    error.keyPattern !== null &&
    "code" in (error.keyPattern as Record<string, unknown>)
  ) {
    return true;
  }

  return false;
}
