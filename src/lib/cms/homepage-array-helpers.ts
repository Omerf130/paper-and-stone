import type { HomepageSectionKey } from "@/types/cms-content";

export function normalizeArrayOrder<T extends { order: number }>(items: T[]): T[] {
  return items
    .map((item, index) => ({ ...item, order: index }))
    .sort((left, right) => left.order - right.order);
}

export function moveArrayItemUp<T>(items: T[], index: number): T[] {
  if (index <= 0 || index >= items.length) {
    return items;
  }

  const next = [...items];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
}

export function moveArrayItemDown<T>(items: T[], index: number): T[] {
  if (index < 0 || index >= items.length - 1) {
    return items;
  }

  const next = [...items];
  [next[index], next[index + 1]] = [next[index + 1], next[index]];
  return next;
}

export function moveSectionOrderUp(
  order: HomepageSectionKey[],
  index: number,
): HomepageSectionKey[] {
  if (index <= 1 || index >= order.length) {
    return order;
  }

  const next = [...order];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
}

export function moveSectionOrderDown(
  order: HomepageSectionKey[],
  index: number,
): HomepageSectionKey[] {
  if (index < 1 || index >= order.length - 1) {
    return order;
  }

  const next = [...order];
  [next[index], next[index + 1]] = [next[index + 1], next[index]];
  return next;
}
