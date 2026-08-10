export function slugifyKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function createStableKey(
  prefix: string,
  label: string,
  existingKeys: string[],
): string {
  const base = slugifyKey(label) || prefix;
  let candidate = base;
  let counter = 2;

  while (existingKeys.includes(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export function createFabricKey(label: string, existingKeys: string[]): string {
  return createStableKey("fabric", label, existingKeys);
}

export function createColorKey(
  label: string,
  existingKeys: string[],
): string {
  return createStableKey("color", label, existingKeys);
}

export function createSizeKey(label: string, existingKeys: string[]): string {
  return createStableKey("size", label, existingKeys);
}
