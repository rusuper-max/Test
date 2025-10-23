"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ScrollRestorer({
  storageKey = "home:scrollY",
  param = "restore",
}: {
  storageKey?: string;
  param?: string;
}) {
  const sp = useSearchParams();

  useEffect(() => {
    if (sp.get(param) === "1") {
      const y = Number(sessionStorage.getItem(storageKey) || "0");
      if (!Number.isNaN(y) && y > 0) {
        // sačekaj layout pa skroluj
        requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" }));
        setTimeout(() => window.scrollTo({ top: y, behavior: "auto" }), 0);
      }
      sessionStorage.removeItem(storageKey);
      // očisti param iz URL-a
      const url = new URL(window.location.href);
      url.searchParams.delete(param);
      history.replaceState({}, "", url.toString());
    }
  }, [sp, storageKey, param]);

  return null;
}