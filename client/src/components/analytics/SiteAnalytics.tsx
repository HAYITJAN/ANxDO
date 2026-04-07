"use client";

import { publicApiBase as apiBase } from "@/lib/publicApiBase";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Har bir sahifa ochilganda backendga kunlik "sahifa ko‘rishi" sanashini yuboradi.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
    }
    fetch(`${apiBase}/analytics/pageview`, { method: "POST", mode: "cors" }).catch(() => {});
  }, [pathname]);

  return null;
}
