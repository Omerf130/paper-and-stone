import { describe, expect, it } from "vitest";
import Project from "@/models/Project";

describe("Project model", () => {
  it("declares owner and status indexes", () => {
    const indexes = Project.schema.indexes();
    const flattened = indexes.map(([fields]) => fields);

    expect(flattened).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerUserId: 1, updatedAt: -1 }),
        expect.objectContaining({ ownerUserId: 1, status: 1 }),
      ]),
    );
  });
});
