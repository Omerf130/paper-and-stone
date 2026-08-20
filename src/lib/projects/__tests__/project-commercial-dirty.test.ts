import { describe, expect, it } from "vitest";
import {
  appendCommercialDirtyToSet,
  commercialDirtyUpdateFields,
  isCommercialDirty,
  shouldMarkCommercialDirty,
} from "@/lib/projects/project-commercial-dirty";

describe("project-commercial-dirty", () => {
  const approvedLayered = {
    onboardingStatus: "active" as const,
    status: "approved" as const,
    commercialDirty: false,
  };

  it("marks dirty only for approved layered projects not yet dirty", () => {
    expect(shouldMarkCommercialDirty(approvedLayered)).toBe(true);
    expect(
      commercialDirtyUpdateFields(approvedLayered),
    ).toMatchObject({ commercialDirty: true });
  });

  it("does not mark dirty for draft or changes_requested", () => {
    expect(
      shouldMarkCommercialDirty({ ...approvedLayered, status: "draft" }),
    ).toBe(false);
    expect(
      shouldMarkCommercialDirty({
        ...approvedLayered,
        status: "changes_requested",
      }),
    ).toBe(false);
  });

  it("does not mark dirty for legacy projects", () => {
    expect(
      shouldMarkCommercialDirty({
        onboardingStatus: null,
        status: "approved",
      }),
    ).toBe(false);
  });

  it("is idempotent when already dirty", () => {
    expect(
      commercialDirtyUpdateFields({
        ...approvedLayered,
        commercialDirty: true,
      }),
    ).toBeNull();
  });

  it("appends dirty fields to update set", () => {
    const $set: Record<string, unknown> = { name: "Test" };
    appendCommercialDirtyToSet(approvedLayered, $set);
    expect($set.commercialDirty).toBe(true);
    expect($set.commercialDirtyAt).toBeInstanceOf(Date);
  });

  it("detects commercial dirty flag", () => {
    expect(isCommercialDirty({ commercialDirty: true })).toBe(true);
    expect(isCommercialDirty({ commercialDirty: false })).toBe(false);
    expect(isCommercialDirty({})).toBe(false);
  });
});
