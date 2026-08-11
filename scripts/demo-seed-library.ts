/**
 * Demo seed colors for development only.
 * These HEX values are NOT authoritative Paper & Stone brand colors.
 * Admin-maintained Color records are the production source of truth.
 * Seed uses $setOnInsert so existing admin-edited records are never overwritten.
 */
export const DEMO_SEED_COLORS = [
  { code: "DEMO-BLUE", nameHe: "כחול", hex: "#2B4C7E", sortOrder: 1 },
  { code: "DEMO-MUSTARD", nameHe: "חרדל", hex: "#C4A035", sortOrder: 2 },
  { code: "DEMO-GRAY", nameHe: "אפור", hex: "#808080", sortOrder: 3 },
  { code: "DEMO-NATURAL", nameHe: "טבעי", hex: "#D4C4A8", sortOrder: 4 },
  { code: "DEMO-STONE", nameHe: "אבן", hex: "#9E9E9E", sortOrder: 5 },
  { code: "DEMO-SAGE", nameHe: "ירוק מרווה", hex: "#8A9A7B", sortOrder: 6 },
] as const;

export const DEMO_SEED_MATERIALS = [
  {
    code: "DEMO-VELVET",
    nameHe: "Velvet",
    nameEn: "Velvet",
    type: "FABRIC" as const,
    sortOrder: 1,
    colorCodes: ["DEMO-BLUE", "DEMO-MUSTARD", "DEMO-GRAY"],
  },
  {
    code: "DEMO-LINEN",
    nameHe: "Linen",
    nameEn: "Linen",
    type: "FABRIC" as const,
    sortOrder: 2,
    colorCodes: ["DEMO-NATURAL", "DEMO-STONE", "DEMO-SAGE"],
  },
] as const;
