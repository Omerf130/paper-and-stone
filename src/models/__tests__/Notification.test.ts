import { describe, expect, it } from "vitest";
import Notification from "@/models/Notification";

describe("Notification model", () => {
  it("declares inbox and idempotency indexes", () => {
    const indexes = Notification.schema.indexes();
    const flattened = indexes.map(([fields, options]) => ({
      fields,
      unique: options?.unique,
    }));

    expect(flattened).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fields: expect.objectContaining({
            recipientUserId: 1,
            isRead: 1,
            createdAt: -1,
          }),
        }),
      ]),
    );

    expect(
      flattened.some(
        (index) =>
          index.fields.idempotencyKey === 1 && index.unique === true,
      ),
    ).toBe(true);
  });
});
