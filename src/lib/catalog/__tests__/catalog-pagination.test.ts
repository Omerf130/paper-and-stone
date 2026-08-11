import { describe, expect, it } from "vitest";
import {
  calculatePagination,
  getVisiblePageNumbers,
  normalizePage,
} from "@/lib/catalog/catalog-pagination";

describe("catalog pagination", () => {
  it("normalizes invalid pages to 1", () => {
    expect(normalizePage(-2)).toBe(1);
    expect(normalizePage(Number.NaN)).toBe(1);
  });

  it("clamps page above totalPages", () => {
    expect(
      calculatePagination({ total: 24, page: 999, pageSize: 12 }),
    ).toEqual({
      page: 2,
      pageSize: 12,
      totalPages: 2,
      skip: 12,
    });
  });

  it("returns page 1 and totalPages 0 when total is 0", () => {
    expect(
      calculatePagination({ total: 0, page: 5, pageSize: 12 }),
    ).toEqual({
      page: 1,
      pageSize: 12,
      totalPages: 0,
      skip: 0,
    });
  });

  it("returns compact visible page numbers", () => {
    expect(getVisiblePageNumbers(5, 10)).toEqual([1, 4, 5, 6, 10]);
  });
});
