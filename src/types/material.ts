export const MATERIAL_TYPES = [
  "FABRIC",
  "LEATHER",
  "WOOD",
  "METAL",
  "GLASS",
  "FINISH",
  "OTHER",
] as const;

export type MaterialType = (typeof MATERIAL_TYPES)[number];

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  FABRIC: "בד",
  LEATHER: "עור",
  WOOD: "עץ",
  METAL: "מתכת",
  GLASS: "זכוכית",
  FINISH: "גימור",
  OTHER: "אחר",
};

export function isMaterialType(value: string): value is MaterialType {
  return MATERIAL_TYPES.includes(value as MaterialType);
}
