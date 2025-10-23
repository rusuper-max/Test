"use client";
import { useEffect, useState } from "react";
import { PLANS, type PlanSlug } from "@/data/packages";

export function useMinBaseByPlan() {
  const [min, setMin] = useState<Record<PlanSlug, number>>({
    basic: PLANS.basic.basePrice,
    classic: PLANS.classic.basePrice,
    signature: PLANS.signature.basePrice,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/inquiry/addons?debug=0", { cache: "no-store" });
        const j = await res.json();
        const base = j?.base || {};
        const out: Record<PlanSlug, number> = { ...min };
        for (const p of ["basic","classic","signature"] as PlanSlug[]) {
          let m = Infinity;
          for (const ev of Object.keys(base)) {
            const v = base[ev]?.[p];
            if (typeof v === "number" && !Number.isNaN(v) && v < m) m = v;
          }
          out[p] = Number.isFinite(m) ? m : PLANS[p].basePrice;
        }
        if (!cancelled) setMin(out);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  return min;
}