import { describe, expect, it } from "vitest";
import {
  computeDisplayTransform,
  computeFitTransform,
  displayToNatural,
  naturalToDisplay,
} from "@/lib/recolor/mask-editor/coordinates";

describe("coordinates", () => {
  it("maps display to natural and back with fit transform", () => {
    const natural = { width: 2400, height: 1600 };
    const container = { width: 900, height: 600 };
    const transform = computeFitTransform(natural, container, 1);

    const displayPoint = { x: transform.offsetX + 100, y: transform.offsetY + 50 };
    const naturalPoint = displayToNatural(displayPoint, transform, natural);
    const roundTrip = naturalToDisplay(naturalPoint, transform);

    expect(roundTrip.x).toBeCloseTo(displayPoint.x, 5);
    expect(roundTrip.y).toBeCloseTo(displayPoint.y, 5);
  });

  it("clamps natural coordinates to image bounds", () => {
    const natural = { width: 100, height: 100 };
    const transform = computeFitTransform(natural, { width: 200, height: 200 }, 1);

    const point = displayToNatural({ x: -50, y: -50 }, transform, natural);
    expect(point.x).toBe(0);
    expect(point.y).toBe(0);

    const farPoint = displayToNatural({ x: 9999, y: 9999 }, transform, natural);
    expect(farPoint.x).toBe(99);
    expect(farPoint.y).toBe(99);
  });

  it("uses natural pixel scale at 100% zoom mode", () => {
    const natural = { width: 1000, height: 800 };
    const container = { width: 500, height: 400 };
    const transform = computeDisplayTransform(natural, container, 1);

    expect(transform.scale).toBe(1);
    expect(transform.displayWidth).toBe(1000);
    expect(transform.displayHeight).toBe(800);
  });
});
