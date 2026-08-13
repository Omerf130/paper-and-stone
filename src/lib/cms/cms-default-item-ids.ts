/**
 * Deterministic stable IDs for default Homepage CMS array items.
 * These literals are permanent identities for Admin editing and nested media targeting.
 * Do NOT generate IDs at runtime when building DEFAULT_HOMEPAGE_CONTENT.
 */

export const HOMEPAGE_DEFAULT_CATEGORY_ITEM_IDS = {
  sofas: "a1000001-0001-4001-8001-000000000001",
  armchairs: "a1000001-0001-4001-8001-000000000002",
  chairs: "a1000001-0001-4001-8001-000000000003",
  tables: "a1000001-0001-4001-8001-000000000004",
  lighting: "a1000001-0001-4001-8001-000000000005",
  materials: "a1000001-0001-4001-8001-000000000006",
} as const;

export const HOMEPAGE_DEFAULT_INSPIRATION_ITEM_IDS = {
  "residence-01": "b2000002-0002-4002-8002-000000000001",
  "private-house": "b2000002-0002-4002-8002-000000000002",
  "interior-study": "b2000002-0002-4002-8002-000000000003",
} as const;

export const HOMEPAGE_DEFAULT_PROFESSIONAL_STEP_IDS = {
  "01": "c3000003-0003-4003-8003-000000000001",
  "02": "c3000003-0003-4003-8003-000000000002",
  "03": "c3000003-0003-4003-8003-000000000003",
  "04": "c3000003-0003-4003-8003-000000000004",
} as const;
