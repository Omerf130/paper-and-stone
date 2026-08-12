import { describe, expect, it } from "vitest";
import {
  ABSOLUTE_MAX_UNDO_STATES,
  HISTORY_MEMORY_BUDGET_BYTES,
} from "@/lib/recolor/mask-editor/constants";
import {
  canRedo,
  canUndo,
  clearHistory,
  cloneAlphaPlane,
  computeEffectiveMaxStates,
  createMaskHistory,
  getHistoryMemoryUsage,
  pushUndoSnapshot,
  redo,
  snapshotSizeBytes,
  undo,
} from "@/lib/recolor/mask-editor/history";

function makeAlpha(size: number, fill = 0): Uint8Array {
  const alpha = new Uint8Array(size);
  if (fill > 0) {
    alpha.fill(fill);
  }
  return alpha;
}

describe("history", () => {
  it("allows up to 12 states for small images", () => {
    const max = computeEffectiveMaxStates(100, 100);
    expect(max).toBe(12);
  });

  it("reduces effective states for large images", () => {
    const width = 8000;
    const height = 8000;
    const snapshotSize = snapshotSizeBytes(width, height);
    const max = computeEffectiveMaxStates(width, height);

    expect(snapshotSize).toBeGreaterThan(HISTORY_MEMORY_BUDGET_BYTES / 12);
    expect(max).toBeLessThan(12);
    expect(max).toBe(
      Math.floor(HISTORY_MEMORY_BUDGET_BYTES / snapshotSize),
    );
  });

  it("keeps at least one history state when technically possible", () => {
    expect(computeEffectiveMaxStates(100000, 100000)).toBe(1);
  });

  it("never exceeds combined memory budget", () => {
    const history = createMaskHistory(2000, 2000);

    for (let i = 0; i < 20; i += 1) {
      pushUndoSnapshot(history, makeAlpha(2000 * 2000, i + 1));
    }

    expect(getHistoryMemoryUsage(history)).toBeLessThanOrEqual(
      HISTORY_MEMORY_BUDGET_BYTES,
    );
    expect(
      history.undoStack.length + history.redoStack.length,
    ).toBeLessThanOrEqual(history.effectiveMaxStates);
  });

  it("clears redo after a new edit", () => {
    const history = createMaskHistory(10, 10);
    const current = makeAlpha(100);

    pushUndoSnapshot(history, makeAlpha(100, 1));
    undo(history, current);
    expect(canRedo(history)).toBe(true);

    pushUndoSnapshot(history, makeAlpha(100, 2));
    expect(canRedo(history)).toBe(false);
  });

  it("transfers ownership between undo and redo without growing history", () => {
    const history = createMaskHistory(10, 10);
    const current = cloneAlphaPlane(makeAlpha(100, 5));

    pushUndoSnapshot(history, makeAlpha(100, 1));
    const beforeUndoCount =
      history.undoStack.length + history.redoStack.length;

    const restored = undo(history, current);
    expect(restored).not.toBeNull();
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(true);

    const beforeRedoCount =
      history.undoStack.length + history.redoStack.length;
    expect(beforeRedoCount).toBe(beforeUndoCount);

    redo(history, restored!);
    expect(canUndo(history)).toBe(true);
    expect(canRedo(history)).toBe(false);
    expect(
      history.undoStack.length + history.redoStack.length,
    ).toBeLessThanOrEqual(history.effectiveMaxStates);
  });

  it("clears all history on demand", () => {
    const history = createMaskHistory(10, 10);
    pushUndoSnapshot(history, makeAlpha(100, 1));
    clearHistory(history);
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(false);
  });

  it("respects absolute max of 12 states", () => {
    const history = createMaskHistory(100, 100);
    expect(history.effectiveMaxStates).toBe(ABSOLUTE_MAX_UNDO_STATES);

    for (let i = 0; i < 20; i += 1) {
      pushUndoSnapshot(history, makeAlpha(100 * 100, i + 1));
    }

    expect(
      history.undoStack.length + history.redoStack.length,
    ).toBeLessThanOrEqual(12);
  });
});
