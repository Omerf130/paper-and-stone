const HEX_6_PATTERN = /^#([0-9A-Fa-f]{6})$/;
const HEX_3_PATTERN = /^#([0-9A-Fa-f]{3})$/;

export function normalizeHex(value: string): string | null {
  const trimmed = value.trim();

  const match6 = trimmed.match(HEX_6_PATTERN);
  if (match6) {
    return `#${match6[1].toUpperCase()}`;
  }

  const match3 = trimmed.match(HEX_3_PATTERN);
  if (match3) {
    const expanded = match3[1]
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
    return `#${expanded.toUpperCase()}`;
  }

  return null;
}
