const MAX_FILENAME_LENGTH = 80;

export function sanitizeFilename(filename: string): string {
  const basename = filename.split(/[/\\]/).pop() ?? "file";
  const sanitized = basename
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  if (!sanitized || sanitized === "." || sanitized === "..") {
    return "file";
  }

  return sanitized.slice(0, MAX_FILENAME_LENGTH);
}
