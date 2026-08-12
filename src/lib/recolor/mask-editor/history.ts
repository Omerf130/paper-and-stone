import {
  ABSOLUTE_MAX_UNDO_STATES,
  HISTORY_MEMORY_BUDGET_BYTES,
} from "./constants";

export type AlphaSnapshot = Uint8Array;

export function snapshotSizeBytes(width: number, height: number): number {
  return width * height;
}

export function computeEffectiveMaxStates(
  width: number,
  height: number,
  absoluteMax: number = ABSOLUTE_MAX_UNDO_STATES,
  memoryBudget: number = HISTORY_MEMORY_BUDGET_BYTES,
): number {
  const size = snapshotSizeBytes(width, height);
  if (size <= 0) {
    return 1;
  }

  const budgetMax = Math.floor(memoryBudget / size);
  return Math.max(1, Math.min(absoluteMax, budgetMax));
}

export function extractAlphaPlane(maskData: ImageData): AlphaSnapshot {
  const { width, height, data } = maskData;
  const alpha = new Uint8Array(width * height);

  for (let i = 0; i < alpha.length; i += 1) {
    alpha[i] = data[i * 4 + 3];
  }

  return alpha;
}

export function applyAlphaPlane(maskData: ImageData, alpha: AlphaSnapshot): void {
  const { width, height, data } = maskData;

  if (alpha.length !== width * height) {
    throw new Error("Alpha plane size mismatch");
  }

  for (let i = 0; i < alpha.length; i += 1) {
    const dataIndex = i * 4;
    if (alpha[i] > 0) {
      data[dataIndex] = 255;
      data[dataIndex + 1] = 255;
      data[dataIndex + 2] = 255;
      data[dataIndex + 3] = 255;
    } else {
      data[dataIndex] = 0;
      data[dataIndex + 1] = 0;
      data[dataIndex + 2] = 0;
      data[dataIndex + 3] = 0;
    }
  }
}

export function cloneAlphaPlane(alpha: AlphaSnapshot): AlphaSnapshot {
  return new Uint8Array(alpha);
}

export type MaskHistory = {
  undoStack: AlphaSnapshot[];
  redoStack: AlphaSnapshot[];
  width: number;
  height: number;
  effectiveMaxStates: number;
};

export function createMaskHistory(width: number, height: number): MaskHistory {
  return {
    undoStack: [],
    redoStack: [],
    width,
    height,
    effectiveMaxStates: computeEffectiveMaxStates(width, height),
  };
}

export function getHistoryMemoryUsage(history: MaskHistory): number {
  const totalStates = history.undoStack.length + history.redoStack.length;
  return totalStates * snapshotSizeBytes(history.width, history.height);
}

function trimCombinedStacks(history: MaskHistory): void {
  const snapshotBytes = snapshotSizeBytes(history.width, history.height);
  const maxStates = history.effectiveMaxStates;

  while (
    history.undoStack.length + history.redoStack.length > maxStates &&
    history.undoStack.length > 1
  ) {
    history.undoStack.shift();
  }

  while (
    history.undoStack.length + history.redoStack.length > maxStates &&
    history.redoStack.length > 0
  ) {
    history.redoStack.shift();
  }

  if (snapshotBytes > HISTORY_MEMORY_BUDGET_BYTES) {
    history.undoStack = history.undoStack.slice(-1);
    history.redoStack = [];
  }
}

export function pushUndoSnapshot(
  history: MaskHistory,
  snapshot: AlphaSnapshot,
): void {
  history.redoStack = [];
  history.undoStack.push(snapshot);
  trimCombinedStacks(history);
}

export function undo(
  history: MaskHistory,
  current: AlphaSnapshot,
): AlphaSnapshot | null {
  if (history.undoStack.length === 0) {
    return null;
  }

  const previous = history.undoStack.pop()!;
  history.redoStack.push(current);
  trimCombinedStacks(history);
  return previous;
}

export function redo(
  history: MaskHistory,
  current: AlphaSnapshot,
): AlphaSnapshot | null {
  if (history.redoStack.length === 0) {
    return null;
  }

  const next = history.redoStack.pop()!;
  history.undoStack.push(current);
  trimCombinedStacks(history);
  return next;
}

export function clearHistory(history: MaskHistory): void {
  history.undoStack = [];
  history.redoStack = [];
}

export function canUndo(history: MaskHistory): boolean {
  return history.undoStack.length > 0;
}

export function canRedo(history: MaskHistory): boolean {
  return history.redoStack.length > 0;
}
