import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { resolveProjectMessageSendId } from "@/lib/project-messages/resolveProjectMessageSendId";

describe("resolveProjectMessageSendId", () => {
  it("returns the real Mongo project id for server actions", () => {
    const projectId = "507f1f77bcf86cd799439013";

    expect(resolveProjectMessageSendId(projectId)).toBe(projectId);
    expect(Types.ObjectId.isValid(resolveProjectMessageSendId(projectId))).toBe(
      true,
    );
  });

  it("documents that prefixed DOM ids must not be sent to server actions", () => {
    const projectId = "507f1f77bcf86cd799439013";
    const prefixedDomId = `client-messages-${projectId}`;

    expect(Types.ObjectId.isValid(prefixedDomId)).toBe(false);
    expect(resolveProjectMessageSendId(projectId)).not.toBe(prefixedDomId);
  });
});
