import { describe, expect, it } from "vitest";
import ProjectMessage from "@/models/ProjectMessage";

describe("ProjectMessage model", () => {
  it("declares project timeline indexes", () => {
    const indexes = ProjectMessage.schema.indexes();
    const flattened = indexes.map(([fields]) => fields);

    expect(flattened).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ projectId: 1, createdAt: -1 }),
        expect.objectContaining({
          projectId: 1,
          conversationType: 1,
          clientUserIdAtSend: 1,
          createdAt: -1,
        }),
      ]),
    );
  });

  it("restricts senderRole and audience enums", () => {
    const senderRole = ProjectMessage.schema.path("senderRole");
    const audience = ProjectMessage.schema.path("audience");
    const conversationType = ProjectMessage.schema.path("conversationType");

    expect(senderRole?.options?.enum).toEqual([
      "professional",
      "admin",
      "architect",
      "client",
    ]);
    expect(audience?.options?.enum).toEqual([
      "professional",
      "admin",
      "architect",
      "client",
    ]);
    expect(conversationType?.options?.enum).toEqual([
      "admin_architect",
      "architect_client",
    ]);
  });
});
