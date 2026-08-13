"use client";

import { useEffect, useRef, useState } from "react";

const STICKY_TOP_OFFSET_REM = 6;

export function useStickyWhenFits<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [canStick, setCanStick] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const measure = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!isDesktop) {
        setCanStick(false);
        return;
      }

      const rootFontSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const topOffset = STICKY_TOP_OFFSET_REM * rootFontSize;
      const availableHeight = window.innerHeight - topOffset;
      setCanStick(element.scrollHeight <= availableHeight);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return { ref, canStick };
}
