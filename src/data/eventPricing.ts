// src/data/eventPricing.ts
"use client";

import { useEffect, useState } from "react";
import { PLANS, type PlanSlug } from "@/data/packages";

export type MinPerPlan = Record<PlanSlug, number>;

let cache: MinPerPlan | null = null;

async function fetchMinFromApi(): Promise<MinPerPlan> {
  try {
    const res = await fetch("/api/inquiry/addons?debug=0", { cache: "no-store" });
    const j = await res.json();
    const base = j?.base || {};

    const out: MinPerPlan = { basic: Infinity, classic: Infinity, signature: Infinity };
    for (const ev of Object.keys(base)) {
      for (const p of ["basic", "classic", "signature"] as PlanSlug[]) {
        const v = base[ev]?.[p];
        if (typeof v === "number" && !Number.isNaN(v) && v < out[p]) out[p] = v;
      }
    }

    return {
      basic: Number.isFinite(out.basic) ? out.basic : PLANS.basic.basePrice,
      classic: Number.isFinite(out.classic) ? out.classic : PLANS.classic.basePrice,
      signature: Number.isFinite(out.signature) ? out.signature : PLANS.signature.basePrice,
    };
  } catch {
    return {
      basic: PLANS.basic.basePrice,
      classic: PLANS.classic.basePrice,
      signature: PLANS.signature.basePrice,
    };
  }
}

/** Hook za klijentske komponente (npr. PackageCards) */
export function useMinPricePerPlan(): MinPerPlan {
  const [state, setState] = useState<MinPerPlan>({
    basic: PLANS.basic.basePrice,
    classic: PLANS.classic.basePrice,
    signature: PLANS.signature.basePrice,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cache) { setState(cache); return; }
      const res = await fetchMinFromApi();
      cache = res;
      if (!cancelled) setState(res);
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}