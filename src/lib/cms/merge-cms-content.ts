function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeWithDefaults<T extends Record<string, unknown>>(
  defaults: T,
  stored: Partial<T> | undefined,
): T {
  if (!stored) {
    return structuredClone(defaults);
  }

  const result = structuredClone(defaults);

  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const storedValue = stored[key];
    const defaultValue = defaults[key];

    if (storedValue === undefined) {
      continue;
    }

    if (Array.isArray(storedValue)) {
      result[key] = storedValue as T[keyof T];
      continue;
    }

    if (isPlainObject(defaultValue) && isPlainObject(storedValue)) {
      result[key] = mergeWithDefaults(
        defaultValue as Record<string, unknown>,
        storedValue as Partial<Record<string, unknown>>,
      ) as T[keyof T];
      continue;
    }

    result[key] = storedValue as T[keyof T];
  }

  return result;
}
