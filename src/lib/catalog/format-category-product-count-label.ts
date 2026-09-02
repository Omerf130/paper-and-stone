export function formatCategoryProductCountLabel(count: number): string {
  if (count === 1) {
    return "פריט אחד";
  }

  return `${count} פריטים`;
}
