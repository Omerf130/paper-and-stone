"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import ProductRecolorCanvas from "@/components/product/ProductRecolorCanvas/ProductRecolorCanvas";
import Button from "@/components/ui/Button/Button";
import {
  applyBrushStroke,
  type BrushMode,
} from "@/lib/recolor/mask-editor/brush";
import { drawCompositeToDisplay } from "@/lib/recolor/mask-editor/composite";
import {
  BRUSH_SIZE_DEFAULT,
  BRUSH_SIZE_MAX,
  BRUSH_SIZE_MIN,
  type ZoomModeIndex,
} from "@/lib/recolor/mask-editor/constants";
import {
  computeDisplayTransform,
  displayToNatural,
  type DisplayTransform,
} from "@/lib/recolor/mask-editor/coordinates";
import {
  exportMaskToFile,
  exportMaskToPngBlob,
  maskHasContent,
} from "@/lib/recolor/mask-editor/export-mask";
import { floodFillMask } from "@/lib/recolor/mask-editor/flood-fill";
import {
  applyAlphaPlane,
  canRedo,
  canUndo,
  clearHistory,
  cloneAlphaPlane,
  createMaskHistory,
  extractAlphaPlane,
  pushUndoSnapshot,
  redo,
  undo,
  type MaskHistory,
} from "@/lib/recolor/mask-editor/history";
import {
  createEmptyMask,
  loadMaskImageDataFromUrl,
} from "@/lib/recolor/mask-editor/import-mask";
import { loadImageDimensionsFromUrl } from "@/lib/recolor/load-image-dimensions";
import styles from "./ProductMaskEditor.module.scss";

type PreviewColor = {
  id: string;
  name: string;
  hex: string;
};

type EditorTool = "paint" | "erase" | "fill";
type ViewMode = "edit" | "preview";

export type ProductMaskEditorProps = {
  sourceImageUrl: string;
  sourceAlt: string;
  naturalWidth: number;
  naturalHeight: number;
  initialMaskUrl?: string | null;
  allowLoadExistingMask: boolean;
  invalidSourceWarning?: string | null;
  previewColors: PreviewColor[];
  onSave: (file: File) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
};

function loadCrossOriginImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load source image"));
    image.src = url;
  });
}

export default function ProductMaskEditor({
  sourceImageUrl,
  sourceAlt,
  naturalWidth,
  naturalHeight,
  initialMaskUrl,
  allowLoadExistingMask,
  invalidSourceWarning,
  previewColors,
  onSave,
  onCancel,
  isSaving,
}: ProductMaskEditorProps) {
  const brushSliderId = useId();
  const previewColorSelectId = useId();

  const [tool, setTool] = useState<EditorTool>("paint");
  const [brushSize, setBrushSize] = useState(BRUSH_SIZE_DEFAULT);
  const [zoomIndex, setZoomIndex] = useState<ZoomModeIndex>(0);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [showOverlay, setShowOverlay] = useState(true);
  const [previewColorId, setPreviewColorId] = useState(
    previewColors[0]?.id ?? "",
  );
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [redoAvailable, setRedoAvailable] = useState(false);
  const [hasPainted, setHasPainted] = useState(false);
  const [previewMaskUrl, setPreviewMaskUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskDataRef = useRef<ImageData | null>(null);
  const historyRef = useRef<MaskHistory | null>(null);
  const transformRef = useRef<DisplayTransform | null>(null);
  const strokeActiveRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const previewMaskUrlRef = useRef<string | null>(null);

  const previewColor =
    previewColors.find((color) => color.id === previewColorId) ??
    previewColors[0];

  const getBrushMode = (): BrushMode =>
    tool === "erase" ? "erase" : "paint";

  const syncMaskCanvasFromData = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    const maskData = maskDataRef.current;
    if (!maskCanvas || !maskData) {
      return;
    }

    const context = maskCanvas.getContext("2d");
    if (!context) {
      return;
    }

    context.putImageData(maskData, 0, 0);
  }, []);

  const recomputeTransform = useCallback((): DisplayTransform | null => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) {
      return null;
    }

    const transform = computeDisplayTransform(
      { width: naturalWidth, height: naturalHeight },
      { width: wrapper.clientWidth, height: wrapper.clientHeight },
      zoomIndex,
    );

    transformRef.current = transform;
    return transform;
  }, [naturalHeight, naturalWidth, zoomIndex]);

  const scheduleComposite = useCallback(() => {
    if (rafRef.current !== null) {
      return;
    }

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;

      const displayCanvas = displayCanvasRef.current;
      const sourceCanvas = sourceCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const transform = recomputeTransform();

      if (!displayCanvas || !sourceCanvas || !maskCanvas || !transform) {
        return;
      }

      const wrapper = canvasWrapperRef.current;
      if (wrapper) {
        displayCanvas.width = wrapper.clientWidth;
        displayCanvas.height = Math.max(wrapper.clientHeight, transform.displayHeight);
        wrapper.style.minWidth = `${Math.max(wrapper.clientWidth, transform.displayWidth)}px`;
        wrapper.style.minHeight = `${Math.max(320, transform.displayHeight)}px`;
      }

      const context = displayCanvas.getContext("2d");
      if (!context) {
        return;
      }

      drawCompositeToDisplay(
        context,
        transform,
        sourceCanvas,
        maskCanvas,
        showOverlay && viewMode === "edit",
      );
    });
  }, [recomputeTransform, showOverlay, viewMode]);

  const bumpHistoryState = useCallback(() => {
    const history = historyRef.current;
    setUndoAvailable(history ? canUndo(history) : false);
    setRedoAvailable(history ? canRedo(history) : false);
    setHistoryVersion((value) => value + 1);
  }, []);

  const beginStrokeHistory = useCallback(() => {
    const maskData = maskDataRef.current;
    const history = historyRef.current;
    if (!maskData || !history) {
      return;
    }

    pushUndoSnapshot(history, cloneAlphaPlane(extractAlphaPlane(maskData)));
    bumpHistoryState();
  }, [bumpHistoryState]);

  const markPainted = useCallback(() => {
    setHasPainted(true);
  }, []);

  const handleUndo = useCallback(() => {
    const maskData = maskDataRef.current;
    const history = historyRef.current;
    if (!maskData || !history) {
      return;
    }

    const current = extractAlphaPlane(maskData);
    const restored = undo(history, current);
    if (!restored) {
      return;
    }

    applyAlphaPlane(maskData, restored);
    syncMaskCanvasFromData();
    setHasPainted(maskHasContent(maskData));
    scheduleComposite();
    bumpHistoryState();
  }, [bumpHistoryState, scheduleComposite, syncMaskCanvasFromData]);

  const handleRedo = useCallback(() => {
    const maskData = maskDataRef.current;
    const history = historyRef.current;
    if (!maskData || !history) {
      return;
    }

    const current = extractAlphaPlane(maskData);
    const restored = redo(history, current);
    if (!restored) {
      return;
    }

    applyAlphaPlane(maskData, restored);
    syncMaskCanvasFromData();
    setHasPainted(maskHasContent(maskData));
    scheduleComposite();
    bumpHistoryState();
  }, [bumpHistoryState, scheduleComposite, syncMaskCanvasFromData]);

  const handleClear = useCallback(() => {
    const maskData = maskDataRef.current;
    const history = historyRef.current;
    if (!maskData || !history) {
      return;
    }

    beginStrokeHistory();
    maskData.data.fill(0);
    syncMaskCanvasFromData();
    setHasPainted(false);
    scheduleComposite();
  }, [beginStrokeHistory, scheduleComposite, syncMaskCanvasFromData]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const [image, dimensions] = await Promise.all([
          loadCrossOriginImage(sourceImageUrl),
          loadImageDimensionsFromUrl(sourceImageUrl),
        ]);

        if (cancelled) {
          return;
        }

        if (
          dimensions.width !== naturalWidth ||
          dimensions.height !== naturalHeight
        ) {
          throw new Error("Source image dimensions mismatch");
        }

        const sourceCanvas = document.createElement("canvas");
        sourceCanvas.width = naturalWidth;
        sourceCanvas.height = naturalHeight;
        const sourceContext = sourceCanvas.getContext("2d");
        if (!sourceContext) {
          throw new Error("Canvas unsupported");
        }
        sourceContext.drawImage(image, 0, 0);

        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = naturalWidth;
        maskCanvas.height = naturalHeight;
        const maskContext = maskCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!maskContext) {
          throw new Error("Canvas unsupported");
        }

        let maskData = createEmptyMask(naturalWidth, naturalHeight);

        if (allowLoadExistingMask && initialMaskUrl) {
          try {
            maskData = await loadMaskImageDataFromUrl(
              initialMaskUrl,
              naturalWidth,
              naturalHeight,
            );
            setHasPainted(maskHasContent(maskData));
          } catch {
            setError("לא ניתן לטעון את המסכה הקיימת. מתחילים עם מסכה ריקה.");
          }
        }

        maskContext.putImageData(maskData, 0, 0);

        sourceCanvasRef.current = sourceCanvas;
        maskCanvasRef.current = maskCanvas;
        maskDataRef.current = maskData;
        historyRef.current = createMaskHistory(naturalWidth, naturalHeight);
        setUndoAvailable(false);
        setRedoAvailable(false);
        setStatus("ready");
        scheduleComposite();
      } catch {
        if (!cancelled) {
          setStatus("failed");
          setError("לא ניתן לטעון את התמונה לעריכה.");
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
      if (historyRef.current) {
        clearHistory(historyRef.current);
      }
      if (previewMaskUrlRef.current) {
        URL.revokeObjectURL(previewMaskUrlRef.current);
        previewMaskUrlRef.current = null;
      }
    };
  }, [
    allowLoadExistingMask,
    initialMaskUrl,
    naturalHeight,
    naturalWidth,
    scheduleComposite,
    sourceImageUrl,
  ]);

  useEffect(() => {
    scheduleComposite();
  }, [scheduleComposite, showOverlay, viewMode, zoomIndex]);

  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) {
      return;
    }

    const observer = new ResizeObserver(() => {
      scheduleComposite();
    });

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [scheduleComposite]);

  useEffect(() => {
    if (viewMode !== "preview" || !maskDataRef.current) {
      if (previewMaskUrlRef.current) {
        URL.revokeObjectURL(previewMaskUrlRef.current);
        previewMaskUrlRef.current = null;
        setPreviewMaskUrl(null);
      }
      return;
    }

    let cancelled = false;

    void (async () => {
      const maskData = maskDataRef.current;
      if (!maskData) {
        return;
      }

      const blob = await exportMaskToPngBlob(maskData);
      if (cancelled) {
        return;
      }

      if (previewMaskUrlRef.current) {
        URL.revokeObjectURL(previewMaskUrlRef.current);
      }

      const url = URL.createObjectURL(blob);
      previewMaskUrlRef.current = url;
      setPreviewMaskUrl(url);
    })();

    return () => {
      cancelled = true;
    };
  }, [viewMode, historyVersion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const mod = event.metaKey || event.ctrlKey;
      if (!mod) {
        return;
      }

      if (event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      } else if (
        event.key.toLowerCase() === "z" &&
        event.shiftKey
      ) {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleRedo, handleUndo]);

  const pointerToNatural = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    const transform = transformRef.current ?? recomputeTransform();
    if (!canvas || !transform) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    return displayToNatural(
      {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
      transform,
      { width: naturalWidth, height: naturalHeight },
    );
  };

  const applyToolAtPoint = (point: { x: number; y: number }) => {
    const maskData = maskDataRef.current;
    if (!maskData) {
      return false;
    }

    if (tool === "fill") {
      return floodFillMask(maskData, point, "paint");
    }

    if (lastPointRef.current) {
      return applyBrushStroke(
        maskData,
        lastPointRef.current,
        point,
        brushSize,
        getBrushMode(),
      );
    }

    return applyBrushStroke(
      maskData,
      point,
      point,
      brushSize,
      getBrushMode(),
    );
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (viewMode !== "edit" || status !== "ready" || isSaving) {
      return;
    }

    event.preventDefault();
    const point = pointerToNatural(event);
    if (!point) {
      return;
    }

    beginStrokeHistory();
    strokeActiveRef.current = true;
    lastPointRef.current = point;
    event.currentTarget.setPointerCapture(event.pointerId);

    const changed = applyToolAtPoint(point);
    if (changed) {
      markPainted();
      syncMaskCanvasFromData();
      scheduleComposite();
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!strokeActiveRef.current || viewMode !== "edit" || tool === "fill") {
      return;
    }

    event.preventDefault();
    const point = pointerToNatural(event);
    if (!point) {
      return;
    }

    const changed = applyToolAtPoint(point);
    lastPointRef.current = point;

    if (changed) {
      markPainted();
      syncMaskCanvasFromData();
      scheduleComposite();
    }
  };

  const finishPointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!strokeActiveRef.current) {
      return;
    }

    strokeActiveRef.current = false;
    lastPointRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    const maskData = maskDataRef.current;
    if (!maskData) {
      return;
    }

    if (!hasPainted && !maskHasContent(maskData)) {
      setSaveError("יש לסמן לפחות אזור אחד לפני שמירה.");
      return;
    }

    try {
      const file = await exportMaskToFile(maskData);
      await onSave(file);
    } catch {
      setSaveError("אירעה שגיאה בשמירת המסכה.");
    }
  };

  if (status === "failed") {
    return (
      <div className={styles.editor}>
        <p className={styles.error} role="alert">
          {error ?? "לא ניתן לפתוח את עורך המסכה."}
        </p>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel}>
            סגירה
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <h3 className={styles.heading}>יצירת מסכת צביעה</h3>
      <p className={styles.instructions}>
        סמנו את האזור שישתנה בצבע בעת בחירת צבע. האזורים המסומנים יוצגו בשכבת
        מסכה אדומה. השמירה מייצאת PNG באותן מידות כמו התמונה הראשית.
      </p>
      <p className={styles.mobileHint}>
        לעריכה מדויקת מומלץ להשתמש במסך גדול.
      </p>

      {invalidSourceWarning ? (
        <p className={styles.warning} role="alert">
          {invalidSourceWarning}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} role="status">
          {error}
        </p>
      ) : null}
      {saveError ? (
        <p className={styles.error} role="alert">
          {saveError}
        </p>
      ) : null}

      <div className={styles.toolbar} role="toolbar" aria-label="כלי עריכת מסכה">
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolButton}
            aria-pressed={viewMode === "edit"}
            disabled={isSaving || status === "loading"}
            onClick={() => setViewMode("edit")}
          >
            עריכת מסכה
          </button>
          <button
            type="button"
            className={styles.toolButton}
            aria-pressed={viewMode === "preview"}
            disabled={isSaving || status === "loading"}
            onClick={() => setViewMode("preview")}
          >
            תצוגת צביעה
          </button>
        </div>

        {viewMode === "edit" ? (
          <>
            <div className={styles.toolbarGroup}>
              <button
                type="button"
                className={styles.toolButton}
                aria-pressed={tool === "paint"}
                disabled={isSaving}
                onClick={() => setTool("paint")}
              >
                מברשת
              </button>
              <button
                type="button"
                className={styles.toolButton}
                aria-pressed={tool === "erase"}
                disabled={isSaving}
                onClick={() => setTool("erase")}
              >
                מחק
              </button>
              <button
                type="button"
                className={styles.toolButton}
                aria-pressed={tool === "fill"}
                disabled={isSaving}
                onClick={() => setTool("fill")}
              >
                מילוי
              </button>
            </div>
            <div className={styles.toolbarGroup}>
              <label className={styles.brushControl} htmlFor={brushSliderId}>
                גודל מברשת
                <input
                  id={brushSliderId}
                  className={styles.brushSlider}
                  type="range"
                  min={BRUSH_SIZE_MIN}
                  max={BRUSH_SIZE_MAX}
                  value={brushSize}
                  aria-valuemin={BRUSH_SIZE_MIN}
                  aria-valuemax={BRUSH_SIZE_MAX}
                  aria-valuenow={brushSize}
                  disabled={isSaving}
                  onChange={(event) => setBrushSize(Number(event.target.value))}
                />
                <span>{brushSize}px</span>
              </label>
              <label className={styles.brushControl}>
                <input
                  type="checkbox"
                  checked={showOverlay}
                  disabled={isSaving}
                  onChange={(event) => setShowOverlay(event.target.checked)}
                />
                הצגת שכבת מסכה
              </label>
              <div className={styles.zoomControl}>
                <span>זום</span>
                <select
                  className={styles.select}
                  value={zoomIndex}
                  disabled={isSaving}
                  onChange={(event) =>
                    setZoomIndex(Number(event.target.value) as ZoomModeIndex)
                  }
                >
                  <option value={0}>התאמה</option>
                  <option value={1}>100%</option>
                  <option value={2}>150%</option>
                  <option value={3}>200%</option>
                </select>
              </div>
            </div>
            <div className={styles.toolbarGroup}>
              <button
                type="button"
                className={styles.toolButton}
                disabled={isSaving || !undoAvailable}
                onClick={handleUndo}
              >
                ביטול
              </button>
              <button
                type="button"
                className={styles.toolButton}
                disabled={isSaving || !redoAvailable}
                onClick={handleRedo}
              >
                שחזור
              </button>
              <button
                type="button"
                className={styles.toolButton}
                disabled={isSaving}
                onClick={handleClear}
              >
                ניקוי
              </button>
            </div>
          </>
        ) : null}
      </div>

      {viewMode === "preview" ? (
        <div className={styles.previewSection}>
          <div className={styles.previewControls}>
            <label className={styles.brushControl} htmlFor={previewColorSelectId}>
              צבע לתצוגה מקדימה
              <select
                id={previewColorSelectId}
                className={styles.select}
                value={previewColor?.id ?? ""}
                disabled={!previewColor}
                onChange={(event) => setPreviewColorId(event.target.value)}
              >
                {previewColors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name} ({color.hex})
                  </option>
                ))}
              </select>
            </label>
          </div>
          {previewMaskUrl && previewColor ? (
            <ProductRecolorCanvas
              sourceImage={{ url: sourceImageUrl, alt: sourceAlt }}
              mask={{ url: previewMaskUrl }}
              hex={previewColor.hex}
              fallback={
                <p className={styles.notice}>לא ניתן להציג תצוגה מקדימה.</p>
              }
            />
          ) : (
            <p className={styles.notice}>מכין תצוגה מקדימה…</p>
          )}
        </div>
      ) : (
        <div className={styles.viewport} ref={containerRef}>
          <div className={styles.canvasWrapper} ref={canvasWrapperRef}>
            <canvas
              ref={displayCanvasRef}
              className={styles.displayCanvas}
              role="img"
              aria-label="עורך מסכת צביעה — השתמשו במברשת כדי לסמן אזורים"
              aria-busy={status === "loading"}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointer}
              onPointerCancel={finishPointer}
            />
            {status === "loading" ? (
              <div className={styles.loadingOverlay} aria-live="polite">
                טוען עורך…
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          variant="primary"
          disabled={isSaving || status === "loading"}
          onClick={() => void handleSave()}
        >
          {isSaving ? "שומר…" : "שמירת מסכה"}
        </Button>
        <Button variant="ghost" disabled={isSaving} onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </div>
  );
}
