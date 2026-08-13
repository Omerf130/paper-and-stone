import { describe, expect, it } from "vitest";
import {
  buildMailtoHref,
  buildTelHref,
  buildWhatsAppHref,
  normalizePhoneDigits,
} from "@/lib/cms/contact-link-helpers";

describe("contact-link-helpers", () => {
  it("builds mailto links", () => {
    expect(buildMailtoHref("info@example.com")).toBe("mailto:info@example.com");
  });

  it("normalizes israeli phone digits", () => {
    expect(normalizePhoneDigits("050-123-4567")).toBe("0501234567");
  });

  it("builds tel links with country code", () => {
    expect(buildTelHref("050-123-4567")).toBe("tel:+972501234567");
  });

  it("builds whatsapp links", () => {
    expect(buildWhatsAppHref("050-123-4567")).toBe("https://wa.me/972501234567");
  });
});
