"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const apiBase =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")) ||
  "http://localhost:5000/api";

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
