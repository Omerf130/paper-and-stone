const FORBIDDEN_KEYS = [
  "internalCostAgorot",
  "adminMarkupBp",
  "architectPriceAgorot",
  "architectMarkupBp",
  "defaultInternalCostAgorot",
  "identificationNumber",
] as const;

export function collectObjectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (value == null || typeof value !== "object") {
    return keys;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectObjectKeys(entry, keys);
    }
    return keys;
  }

  for (const [key, nested] of Object.entries(value)) {
    keys.add(key);
    collectObjectKeys(nested, keys);
  }

  return keys;
}

export function assertNoForbiddenClientSnapshotKeys(payload: unknown): void {
  const keys = collectObjectKeys(payload);

  for (const forbidden of FORBIDDEN_KEYS) {
    if (keys.has(forbidden)) {
      throw new Error(`Forbidden key present: ${forbidden}`);
    }
  }
}

export { FORBIDDEN_KEYS };
