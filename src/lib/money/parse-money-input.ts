const MAX_AGOROT = 999_999_999;

export function parseShekelsInputToAgorot(input: string): number | null {
  const trimmed = input.trim().replace(/,/g, "");

  if (!trimmed) {
    return null;
  }

  if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }

  const negative = trimmed.startsWith("-");
  const normalized = negative ? trimmed.slice(1) : trimmed;
  const [wholePart, fractionalPart = ""] = normalized.split(".");
  const wholeAgorot = Number(wholePart) * 100;
  const fractionalAgorot = fractionalPart.padEnd(2, "0").slice(0, 2);
  const agorot = wholeAgorot + Number(fractionalAgorot);

  if (!Number.isSafeInteger(agorot) || agorot > MAX_AGOROT) {
    return null;
  }

  return negative ? -agorot : agorot;
}

export function formatAgorotToShekelsInput(agorot: number): string {
  const negative = agorot < 0;
  const absolute = Math.abs(agorot);
  const whole = Math.floor(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, "0");
  const value = `${whole}.${fraction}`;
  return negative ? `-${value}` : value;
}
