"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isInternalNavigationLink(target: EventTarget | null): HTMLAnchorElement | null {
  const element = target as Element | null;
  if (!element) {
    return null;
  }

  const anchor = element.closest("a");
  if (!anchor) {
    return null;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) {
    return null;
  }

  if (anchor.target && anchor.target !== "_self") {
    return null;
  }

  if (anchor.hasAttribute("download")) {
    return null;
  }

  if (href.startsWith("http://") || href.startsWith("https://")) {
    const absoluteUrl = new URL(href, window.location.href);
    if (absoluteUrl.origin !== window.location.origin) {
      return null;
    }
  }

  return anchor;
}

export function RouteTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 150);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = isInternalNavigationLink(event.target);
      if (!anchor) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      const destination = `${url.pathname}${url.search}`;
      const current = `${window.location.pathname}${window.location.search}`;

      if (destination === current) {
        return;
      }

      setIsLoading(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[120]">
      <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-slate-200/60">
        <div className="h-full w-1/2 animate-pulse bg-teal-600" />
      </div>

      <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-300 border-t-teal-600" />
      </div>
    </div>
  );
}
