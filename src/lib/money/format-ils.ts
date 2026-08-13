export function formatIlsAgorot(agorot: number): string {
  const negative = agorot < 0;
  const absolute = Math.abs(agorot);
  const shekels = absolute / 100;

  const formatted = new Intl.NumberFormat("he-IL", {
    minimumFractionDigits: shekels % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(shekels);

  return negative ? `-${formatted}\u00A0₪` : `${formatted}\u00A0₪`;
}
