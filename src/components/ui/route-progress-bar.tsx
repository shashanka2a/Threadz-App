"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const isInitialMount = useRef(true);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Clear all active timers
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(fn, ms);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const startProgress = useCallback(() => {
    clearAllTimers();
    setVisible(true);
    setProgress(20);

    // Increment gradually for realistic progress feel
    addTimer(() => setProgress(45), 150);
    addTimer(() => setProgress(70), 350);
    addTimer(() => setProgress(85), 700);

    // Failsafe: if navigation never completes (e.g. cancelled/same page), auto-finish after 4s
    addTimer(() => {
      setProgress(100);
      addTimer(() => {
        setVisible(false);
        addTimer(() => setProgress(0), 100);
      }, 300);
    }, 4000);
  }, [clearAllTimers, addTimer]);

  const finishProgress = useCallback(() => {
    clearAllTimers();
    setProgress(100);
    addTimer(() => {
      setVisible(false);
      addTimer(() => {
        setProgress(0);
      }, 100);
    }, 300);
  }, [clearAllTimers, addTimer]);

  // When pathname or searchParams change, route change has completed
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    finishProgress();
  }, [pathname, searchParams, finishProgress]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      startProgress();
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [startProgress]);

  // Global anchor click interceptor for Next.js route transitions
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      // Only handle standard left clicks without modifier keys
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore download, external target, tel, mailto, hash links, javascript
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.rel?.includes("external") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      try {
        const url = new URL(anchor.href, window.location.origin);

        // Only handle same-origin navigation
        if (url.origin !== window.location.origin) {
          return;
        }

        // If clicking a link to the exact same page & query, do NOT start progress bar
        const isSamePage =
          url.pathname === window.location.pathname &&
          url.search === window.location.search;

        if (isSamePage) {
          return;
        }

        startProgress();
      } catch {
        // Ignore malformed URLs
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      clearAllTimers();
    };
  }, [startProgress, clearAllTimers]);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page loading progress"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-foreground shadow-[0_0_8px_rgba(0,0,0,0.3)] dark:shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transition:
            progress === 0
              ? "none"
              : progress === 100
              ? "width 200ms ease-out, opacity 300ms ease-out 100ms"
              : "width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease-out",
        }}
      />
    </div>
  );
}

export function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressIndicator />
    </Suspense>
  );
}


