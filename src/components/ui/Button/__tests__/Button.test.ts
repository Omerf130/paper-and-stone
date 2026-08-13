import { describe, expect, it } from "vitest";
import styles from "@/components/ui/Button/Button.module.scss";

describe("Button styles", () => {
  it("defines core variants", () => {
    expect(styles.primary).toBeDefined();
    expect(styles.secondary).toBeDefined();
    expect(styles.danger).toBeDefined();
    expect(styles.loading).toBeDefined();
  });
});
