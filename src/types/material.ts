/** Built-in material type keys (no OTHER). Custom types live in MaterialType collection. */
export const BUILTIN_MATERIAL_TYPE_KEYS = [
  "FABRIC",
  "LEATHER",
  "WOOD",
  "METAL",
  "GLASS",
  "FINISH",
] as const;

export type BuiltinMaterialTypeKey = (typeof BUILTIN_MATERIAL_TYPE_KEYS)[number];

/** @deprecated Use string material type keys from MaterialType collection */
export const MATERIAL_TYPES = [
  ...BUILTIN_MATERIAL_TYPE_KEYS,
  "OTHER",
] as const;

export type MaterialType = (typeof MATERIAL_TYPES)[number];

export const BUILTIN_MATERIAL_TYPE_LABELS: Record<
  BuiltinMaterialTypeKey,
  string
> = {
  FABRIC: "Fabric",
  LEATHER: "Leather",
  WOOD: "Wood",
  METAL: "Metal",
  GLASS: "Glass",
  FINISH: "Finish",
};

/** @deprecated */
export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  ...BUILTIN_MATERIAL_TYPE_LABELS,
  OTHER: "Other",
};

export function isBuiltinMaterialTypeKey(
  value: string,
): value is BuiltinMaterialTypeKey {
  return BUILTIN_MATERIAL_TYPE_KEYS.includes(value as BuiltinMaterialTypeKey);
}

/** @deprecated */
export function isMaterialType(value: string): value is MaterialType {
  return MATERIAL_TYPES.includes(value as MaterialType);
}

export function resolveMaterialTypeLabel(
  key: string,
  customLabels: Map<string, string> = new Map(),
): string {
  if (customLabels.has(key)) {
    return customLabels.get(key)!;
  }

  if (isBuiltinMaterialTypeKey(key)) {
    return BUILTIN_MATERIAL_TYPE_LABELS[key];
  }

  return key;
}
