// src/components/PricingConfigurator.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PLANS, type PlanSlug } from "@/data/packages";
import { getPlanIncludes } from "@/data/planIncludes";
import { EVENT_TYPES as FALLBACK_EVENTS, type EventType } from "@/lib/addons";
import type { AddonRule } from "@/lib/addons";

/** Vizuelne boje po paketu */
const PLAN_COLORS: Record<PlanSlug, { border: string; orbit: string; badge: string }> = {
  basic: {
    border: "rgba(229,231,235,.55)",
    orbit:
      "conic-gradient(from 0deg, rgba(229,231,235,.0) 0deg, rgba(229,231,235,.75) 25deg, rgba(203,213,225,.0) 50deg, rgba(229,231,235,.0) 360deg)",
    badge: "rgba(229,231,235,.45)",
  },
  classic: {
    border: "rgba(245,208,66,.65)",
    orbit:
      "conic-gradient(from 0deg, rgba(255,227,134,.0) 0deg, rgba(255,227,134,.8) 25deg, rgba(190,147,20,.0) 50deg, rgba(255,227,134,.0) 360deg)",
    badge: "rgba(245,208,66,.55)",
  },
  signature: {
    border: "rgba(45,212,191,.7)",
    orbit:
      "conic-gradient(from 0deg, rgba(94,234,212,.0) 0deg, rgba(94,234,212,.85) 25deg, rgba(20,184,166,.0) 50deg, rgba(94,234,212,.0) 360deg)",
    badge: "rgba(45,212,191,.55)",
  },
};

/** Prikazna imena (vizuelno), slugovi ostaju isti */
const DISPLAY_PLAN_NAME: Record<PlanSlug, string> = {
  basic: "Standard",
  classic: "Premium",
  signature: "Signature",
};

type Props = { initialPlan?: PlanSlug; initialType?: string };

/** Lepo labelovanje za ključ addona */
function prettyLabel(key: string) {
  const k = key.toLowerCase();
  if (k === "secondphotog") return "Drugi fotograf";
  if (k === "thirdphotog" || k === "trecifotograf") return "Treći fotograf";
  if (k === "dodatnikamerman" || k === "secondvideographer") return "Dodatni kamerman";
  if (k === "video") return "Video";
  if (k === "video4k" || k === "4kvideo" || k === "4k video") return "4K video";
  if (k === "drone" || k === "dron") return "Dron";
  if (k === "album") return "Album (premium)";
  if (k === "express" || k === "expres" || k === "ekspres") return "Ekspres obrada";
  if (k === "raw" || k === "rawfiles") return "RAW fajlovi";
  if (k === "printonsite" || k === "izrada foto na licu mesta") return "Izrada fotografija na licu mesta";
  if (k === "usb") return "USB";
  if (k === "dontpublish") return "Ne objavljuj u portfoliju / na mrežama";
  // fallback – Title Case
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\p{L}+/gu, (w) => w[0].toUpperCase() + w.slice(1));
}

/** ——— Pomocni tipovi za prefill iz URL-a ——— */
type InitFromQuery = {
  plan?: PlanSlug;
  type?: string;
  extraHours?: number;
  addons: Record<string, boolean>;
  dontPublish?: boolean;
};

/** ——— URL type → canonical event name (robust match) ——— */
function normalizeAsciiKey(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, ""); // squash non-alphanum
}

/**
 * Pokušava da nađe najbliže poklapanje među event tipovima koje API vraća,
 * tolerantno na dijakritike, sing./plurale i sinonime ("Studio" ↔ "Portret", "Svadba" ↔ "Venčanje", "Rođendan" ↔ "Rođendani" itd).
 */
function findClosestEventType(raw: string | undefined, candidates: string[]): string | undefined {
  if (!raw) return undefined;
  const key = normalizeAsciiKey(raw);
  const pool = candidates.map((c) => ({ raw: c, key: normalizeAsciiKey(c) }));

  // 1) direktno poklapanje po normalizovanom ključu
  const exact = pool.find((p) => p.key === key);
  if (exact) return exact.raw;

  // 2) sinonimi / klasteri
  const CLUSTERS: Record<string, string[]> = {
    svadba: ["svadba", "vencanje", "venčanje"],
    vencanje: ["svadba", "vencanje", "venčanje"],
    studio: ["studio", "portret", "portreti"],
    portret: ["studio", "portret", "portreti"],
    rodjendan: ["rodjendan", "rodjendani", "rodendan", "rodendani", "rođendan", "rođendani"],
    krstenje: ["krstenje", "krstenja", "krštenje", "krštenja"],
    drugo: ["drugo"],
  };

  // nađi klaster kome pripada "key"
  const cluster = Object.values(CLUSTERS).find((arr) => arr.includes(key));
  if (cluster) {
    const hit = pool.find((p) => cluster.includes(p.key));
    if (hit) return hit.raw;
  }

  // 3) soft match: startsWith / contains
  const soft = pool.find((p) => p.key.startsWith(key) || key.startsWith(p.key));
  if (soft) return soft.raw;

  return undefined;
}

function readInitFromUrl(): InitFromQuery {
  if (typeof window === "undefined") return { addons: {} };
  const q = new URLSearchParams(window.location.search);
  const toBool = (x: string | null) => (x ? ["1","true","yes"].includes(x.toLowerCase()) : false);
  const plan = q.get("plan");
  const planSlug = (["basic","classic","signature"] as const).includes(plan as any) ? (plan as PlanSlug) : undefined;
  const extraHours = Number(q.get("extraHours"));
  const addons: Record<string, boolean> = {};
  const known = [
    "secondPhotog","thirdPhotog","secondVideographer","video","video4k","drone",
    "album","express","raw","printOnSite","usb","dontPublish",
  ];
  for (const k of known) if (toBool(q.get(k))) addons[k] = true;
  return {
    plan: planSlug,
    type: q.get("type") || undefined,
    extraHours: Number.isFinite(extraHours) ? extraHours : undefined,
    addons,
    dontPublish: toBool(q.get("dontPublish")),
  };
}
// —— Robustno mapiranje tipa proslave iz URL-a na dostupne iz API-ja ——
function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // skini dijakritiku
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// sinonimi i jednina/množina → kanonsko ime
const TYPE_ALIASES: Record<string, string> = {
  svadba: "Svadba",
  vencanje: "vencanje",
  "venčanje": "Venčanje",

  studio: "Studio",
  portret: "Studio",

  rodjendan: "Rođendan",
  rodjendani: "Rođendan",
  "rođendan": "Rođendan",
  "rođendani": "Rođendan",

  krstenje: "Krštenje",
  "krštenje": "Krštenje",
  krstenja: "Krštenje",
  "krštenja": "Krštenje",

  drugo: "Drugo",
};

function matchEventType(raw: string | undefined | null, available: string[], fallback: string) {
  if (!available?.length) return fallback;
  if (!raw) return available.includes(fallback) ? fallback : available[0];

  const n = norm(raw);

  // 1) direktan alias → kanon, ako postoji u listi
  const aliased = TYPE_ALIASES[n];
  if (aliased && available.includes(aliased)) return aliased;

  // 2) tačno normalizovano poklapanje
  for (const ev of available) if (norm(ev) === n) return ev;

  // 3) "meko" poklapanje (startsWith u oba smera)
  for (const ev of available) {
    const m = norm(ev);
    if (m.startsWith(n) || n.startsWith(m)) return ev;
  }

  // 4) fallback
  return available.includes(fallback) ? fallback : available[0];
}

export default function PricingConfigurator({ initialPlan = "classic", initialType }: Props) {
  const initQ = useRef<InitFromQuery>(readInitFromUrl());
  const [plan, setPlan] = useState<PlanSlug>(initQ.current.plan || initialPlan);
  // SSR-safe inicijalni type: mapiramo searchParams?.type na najbliži dostupni iz FALLBACK_EVENTS
const [eventType, setEventType] = useState<EventType>(() =>
  matchEventType(initialType, FALLBACK_EVENTS as unknown as string[], "Svadba") as EventType
);

  // Excel/Sheets data
  const [events, setEvents] = useState<EventType[]>(FALLBACK_EVENTS);
  const [base, setBase] = useState<Record<string, Record<PlanSlug, number>> | null>(null);
  const [rules, setRules] = useState<Record<string, Record<PlanSlug, Record<string, AddonRule>>>>({} as any);
  const [extras, setExtras] = useState<Record<string, Record<PlanSlug, string[]>>>({} as any);
  const [notes, setNotes] = useState<Record<string, Record<PlanSlug, string>>>({} as any);

  // flag da inicijalni URL prefill primenimo samo jednom i tek kad sve stigne
  const [prefilledFromUrl, setPrefilledFromUrl] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // prvo probamo /api/inquiry/addons (ovde smo ga postavili), pa fallback /api/addons
        let res = await fetch("/api/inquiry/addons?debug=0", { cache: "no-store" });
        if (!res.ok) res = await fetch("/api/addons", { cache: "no-store" });
        if (!res.ok) return;

        const json = await res.json();
        if (!json?.ok) return;

        // USB patch (harmless ako nije potreban)
        const patched = promoteUsbIncluded(json);

        if (!cancelled) {
          setEvents(patched.eventTypes);
          setBase(patched.base);
          setRules(patched.addons);
          setExtras(patched.extrasIncluded);
          setNotes(patched.notes);

// Ako URL/SSR nose 'type' — mapiraj ga na najbliži u onome što API vraća
const desired = initQ.current.type || initialType;
const matched = matchEventType(desired, patched.eventTypes as string[], patched.eventTypes[0]);
setEventType(matched as EventType);

          // Ako URL nosi plan — postavi (već je i inicijalni state)
          const p = initQ.current.plan;
          if (p && p !== plan) setPlan(p);
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error("Fetch addons failed", e);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount

  /** UI state za čekirane addone – dinamički ključ, jer set addona zavisi od event/plan */
  const [addonChecked, setAddonChecked] = useState<Record<string, boolean>>({});

  // Kad promenimo event/plan, resetuj sve što više nije 'available'
  useEffect(() => {
    const current = { ...addonChecked };
    for (const key of addonKeysForCurrent()) {
      const st = effectiveState(key);
      if (st !== "available") current[key] = false;
    }
    setAddonChecked(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, plan]);

  // ——— nakon što stignu rules + base i jednom primeni prefill iz URL-a ———
  const [extraHours, setExtraHours] = useState(0); // +60€/sat
  useEffect(() => {
    if (prefilledFromUrl) return;
    if (!rules || !base || !events?.length) return;

    // primeni posle mikro-tika, da reset efekt iznad odradi prvo
    const timer = setTimeout(() => {
      const q = initQ.current;

      // extraHours
      if (typeof q.extraHours === "number") setExtraHours(q.extraHours);

      // addons (samo oni koji su available u tekućem stanju)
      const keys = addonKeysForCurrent();
      const next: Record<string, boolean> = {};
      for (const k of keys) {
        if (effectiveState(k) === "available" && q.addons[k]) next[k] = true;
      }
      if (q.dontPublish) next["dontPublish"] = true;
      setAddonChecked((s) => ({ ...s, ...next }));

      setPrefilledFromUrl(true);
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, base, events, plan, eventType, prefilledFromUrl]);

  // ——— helpers: čitanje iz API matrica ———
  function effectiveBase(): number {
    const v = base?.[eventType]?.[plan];
    return typeof v === "number" ? v : PLANS[plan].basePrice;
  }
  function effectiveBaseFor(p: PlanSlug): number {
    const v = base?.[eventType]?.[p];
    return typeof v === "number" && !Number.isNaN(v) ? v : PLANS[p].basePrice;
  }

  function effectiveRule(key: string): AddonRule {
    const r = rules?.[eventType]?.[plan]?.[key];
    if (r) return r;
    // Fallback: privacy uvek available 0€
    if (key === "dontPublish") return { state: "available", price: 0 };
    return { state: "hidden" };
  }
  function effectiveState(key: string) { return effectiveRule(key).state; }
  function isAvailableRule(r: AddonRule): r is { state: "available"; price?: number } {
    return !!r && (r as any).state === "available";
  }
  function effectivePrice(key: string): number {
    const r = effectiveRule(key);
    if (isAvailableRule(r) && typeof r.price === "number" && !Number.isNaN(r.price)) {
      return r.price;
    }
    return 0;
  }

  /** Redosled prikaza – prvo poznati bitni addoni, zatim ostali, pa na kraju dontPublish */
  function addonKeysForCurrent(): string[] {
    const raw = Object.keys(rules?.[eventType]?.[plan] ?? {});
    const order = ["secondPhotog", "thirdPhotog", "video", "video4k", "drone", "album", "express", "raw", "printOnSite", "usb"];
    const known = order.filter((k) => raw.includes(k));
    const rest = raw.filter((k) => !order.includes(k));
    const withPrivacy = [...known, ...rest, "dontPublish"]; // privacy uvek postoji (fallback)
    return Array.from(new Set(withPrivacy));
  }

  const basePrice = effectiveBase();

  const price = useMemo(() => {
    let sum = basePrice + extraHours * 60;
    for (const key of addonKeysForCurrent()) {
      const st = effectiveState(key);
      if (st === "available" && addonChecked[key]) {
        sum += effectivePrice(key);
      }
    }
    return Math.round(sum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePrice, extraHours, addonChecked, eventType, plan]);

  const continueHref = useMemo(() => {
    // poznati ključevi koje možemo da prosledimo kroz URL
    const knownKeys = [
      "secondPhotog",
      "thirdPhotog",
      "secondVideographer",
      "video",
      "video4k",
      "drone",
      "album",
      "express",
      "raw",
      "printOnSite",
      "usb",
      "dontPublish",
    ] as const;

    const q = new URLSearchParams({
      plan,
      type: eventType,
      price: String(price),          // hint za orijentacionu cenu
      extraHours: String(extraHours),
    });

    // privacy flag
    if (addonChecked["dontPublish"]) q.set("dontPublish", "1");

    // svi čekirani addoni koje znamo → true
    for (const k of knownKeys) {
      if (k === "dontPublish") continue; // već setovano gore
      if (addonChecked[k]) q.set(k, "1");
    }

    return `/upit?${q.toString()}`;
  }, [plan, eventType, price, extraHours, addonChecked]);

  // Opisi: neutralne stavke + extras + uključeni addoni (sijaju)
  const includesBase = getPlanIncludes(eventType, plan);

  const includedAddons: string[] = addonKeysForCurrent()
    .filter((k) => effectiveState(k) === "included" && k !== "dontPublish")
    .map((k) => prettyLabel(k));

  // dedupe extras
  const extrasRaw = extras?.[eventType]?.[plan] ?? [];
  const extrasIncluded = (() => {
    const seen = new Set<string>();
    return extrasRaw.filter((x: string) => {
      const k = x.trim().toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  })();

  const note = notes?.[eventType]?.[plan];
  const planColor = PLAN_COLORS[plan];

  return (
    <div className="grid gap-6 md:grid-cols-[320px,1fr]">
      {/* LEVO — izbor */}
      <div className="card p-4">
        {/* Tip proslave */}
        <div>
          <div className="text-sm text-white/60">Tip proslave</div>
          <div className="mt-2">
            <div
              className="select-wrap relative"
              style={
                {
                  ["--selBorder" as any]: planColor.border,
                } as React.CSSProperties
              }
            >
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="event-select nice w-full appearance-none rounded-xl border bg-black/40 px-3 py-2 pr-9 transition"
              >
                {events.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="sel-caret pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/70">▾</span>
            </div>
            <div className="mt-1 text-xs text-white/60">
              Cene i mogućnosti zavise od tipa proslave.
            </div>
          </div>
        </div>

        <style>{`
          /* Fancy select wrapper with subtle inner glow that follows the active plan color */
          .select-wrap {
            border-radius: 12px;
            background:
              linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0)) padding-box;
            box-shadow:
              inset 0 0 0 1px var(--selBorder),
              inset 0 0 24px color-mix(in oklab, var(--selBorder) 22%, transparent);
          }
          .select-wrap:hover {
            box-shadow:
              inset 0 0 0 1px var(--selBorder),
              inset 0 0 36px color-mix(in oklab, var(--selBorder) 30%, transparent);
          }
          .event-select.nice {
            outline: none;
            border: 1px solid transparent; /* wrapper drži pravi border */
            background-clip: padding-box;
            backdrop-filter: blur(2px);
          }
          .event-select.nice:focus-visible {
            box-shadow: none;
          }
          .select-wrap:has(select:focus-visible),
          .select-wrap:has(select:focus) {
            box-shadow:
              inset 0 0 0 2px var(--selBorder),
              inset 0 0 42px color-mix(in oklab, var(--selBorder) 36%, transparent);
          }
          .sel-caret {
            filter: drop-shadow(0 1px 0 rgba(0,0,0,.25));
            color: color-mix(in oklab, var(--selBorder) 80%, white);
          }
        `}</style>

        {/* Paketi */}
        <div className="mt-5 text-sm text-white/60">Izbor paketa</div>
        <div className="mt-2 grid gap-2">
          {(["basic","classic","signature"] as PlanSlug[]).map((p) => {
            const isActive = plan === p;
            const color = PLAN_COLORS[p];

            return (
              <div key={p}>
                <button
                  onClick={() => setPlan(p)}
                  aria-pressed={isActive}
                  data-active={isActive}
                  className="offer-btn w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left transition hover:bg-white/5 focus:outline-none"
                  style={{
                    borderColor: isActive ? color.border : "rgba(255,255,255,.10)",
                    boxShadow: isActive ? `0 0 0 1px ${color.border}` : "none",
                    background: isActive ? "rgba(255,255,255,0.03)" : "transparent",
                    ["--planColor" as any]: color.border,
                  }}
                  title={`Izaberi paket ${DISPLAY_PLAN_NAME[p]}`}
                >
                  <div>
                    <div className="font-medium transition-colors" style={{ color: isActive ? color.border : undefined }}>
                      {DISPLAY_PLAN_NAME[p]}
                    </div>
                    <div className="text-xs text-white/70">{PLANS[p].tagline}</div>
                  </div>
                  <div
                    className="text-sm text-white/80 rounded-full px-2.5 py-1 border transition-colors"
                    style={{ borderColor: isActive ? color.badge : "rgba(255,255,255,.0)", color: isActive ? color.border : undefined }}
                  >
                    Počev od {effectiveBaseFor(p).toLocaleString("sr-RS")} €
                  </div>
                </button>

                {/* Collapsible opis za aktivan paket */}
                {isActive && (
                  <details
                    className="mt-2 rounded-xl border bg-white/[0.04] group"
                    style={{
                      borderColor: planColor.border,
                      ["--accent" as any]: planColor.border,
                      ["--accentBadge" as any]: planColor.badge,
                    }}
                  >
                    <summary className="flex items-center justify-between cursor-pointer select-none px-3 py-2">
                      <span className="text-sm text-white/80">Šta ovaj paket uključuje</span>
                      <span className="chev" style={{ color: planColor.border }}>
                        <ChevronIcon />
                      </span>
                    </summary>

                    <div className="px-3 pb-3 pt-1">
                      <ul className="space-y-1.5">
                        {/* 1) Osnovne stavke plana */}
                        {includesBase.map((it, idx) => (
                          <li key={`incbase-${idx}`} className="flex items-start gap-2 text-sm text-white/85">
                            <CheckIcon /><span>{it}</span>
                          </li>
                        ))}

                        {/* 2) Extras iz API-ja */}
                        {extrasIncluded.map((it, idx) => (
                          <li key={`extra-${idx}`} className="flex items-start gap-2 text-sm text-white/80">
                            <CheckIcon /><span>{it}</span>
                          </li>
                        ))}

                        {/* 3) NAPOMENA pre “sijača” (REORDERED) */}
                        {note && (
                          <li key="note" className="flex items-start gap-2 text-sm text-white/85 mt-2">
                            <CheckIcon />
                            <span>{note}</span>
                          </li>
                        )}

                        {/* 4) Uključeni addoni — uvek POSLEDNJI i “sijaju” */}
                        {includedAddons.map((it, idx) => (
                          <li
                            key={`adinc-${idx}`}
                            className="included-shine flex items-start gap-2 text-sm relative rounded-lg border px-2 py-1.5"
                            style={{
                              borderColor: "var(--accentBadge)",
                              color: "var(--accent)",
                              background:
                                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                              boxShadow:
                                "0 0 0 1px var(--accentBadge) inset, 0 0 18px rgba(255,255,255,0.06) inset",
                            }}
                          >
                            <SparkleIcon />
                            <span className="inline-flex items-center gap-2 text-white/90">
                              {it}
                              <span
                                className="rounded-full border px-2 py-0.5 text-xs"
                                style={{ borderColor: "var(--accentBadge)", color: "var(--accent)" }}
                              >
                                Uključeno
                              </span>
                            </span>
                            <span className="shine" />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <style>{`
                      details[open] .chev svg { transform: rotate(180deg); }
                      .chev svg { transition: transform .25s ease; }

                      .included-shine { overflow: hidden; position: relative; }
                      .included-shine .shine {
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.10) 50%, transparent 100%);
                        transform: translateX(-100%);
                        animation: shine-move 2.75s linear infinite;
                        opacity: .5;
                        pointer-events: none;
                      }
                      @keyframes shine-move {
                        0% { transform: translateX(-120%); }
                        60% { transform: translateX(120%); }
                        100% { transform: translateX(120%); }
                      }
                    `}</style>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .offer-btn {
          position: relative;
          overflow: hidden;
          transform: translateZ(0);
          transition: transform .18s ease, background-color .2s ease, border-color .2s ease, box-shadow .2s ease;
        }
        .offer-btn::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 12px;
          pointer-events: none;
          opacity: 0;
          transition: opacity .18s ease;
        }
        /* Pulse + tiny lift only when hovering a NON-active plan */
        .offer-btn:not([data-active="true"]):hover {
          transform: translateZ(0) scale(1.012);
        }
        .offer-btn:not([data-active="true"]):hover::after {
          opacity: .95;
          animation: offer-pulse 1.1s ease-in-out infinite;
          box-shadow:
            0 0 0 1px var(--planColor),
            0 0 22px color-mix(in oklab, var(--planColor) 48%, transparent);
        }
        @keyframes offer-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 1px var(--planColor),
              0 0 18px color-mix(in oklab, var(--planColor) 42%, transparent);
          }
          50% {
            box-shadow:
              0 0 0 1px var(--planColor),
              0 0 34px color-mix(in oklab, var(--planColor) 62%, transparent);
          }
        }
      `}</style>

      {/* DESNO — addoni + rezultat */}
      <div className="card p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* kolona 1: prioritetni addoni */}
          <div className="space-y-3">
            {addonKeysForCurrent()
              .filter((k) => ["secondPhotog","thirdPhotog","video","video4k","drone"].includes(k))
              .filter((k) => effectiveState(k) === "available")
              .map((k) => (
                <LabeledToggle
                  key={k}
                  label={prettyLabel(k)}
                  value={!!addonChecked[k]}
                  onChange={(v) => setAddonChecked((s)=>({ ...s, [k]: v }))}
                  note={priceNote(effectivePrice(k), k)}
                />
              ))}
          </div>

          {/* kolona 2: ostali addoni + privacy + sati posle ponoći */}
          <div className="space-y-3">
            {addonKeysForCurrent()
              .filter((k) => !["secondPhotog","thirdPhotog","video","video4k","drone"].includes(k))
              .filter((k) => effectiveState(k) === "available")
              .map((k) => (
                <div key={k}>
                  <LabeledToggle
                    label={prettyLabel(k)}
                    value={!!addonChecked[k]}
                    onChange={(v) => setAddonChecked((s)=>({ ...s, [k]: v }))}
                    note={priceNote(effectivePrice(k), k)}
                  />
                  {k === "dontPublish" && (
                    <div className="mt-1 text-xs text-white/70">
                      {!addonChecked["dontPublish"]
                        ? "Značilo bi nam da ovu opciju ne uključujete 🙂 (pomaže nam kao preporuka/portfolio)."
                        : "Razumemo i poštujemo 🙂 — ne objavljujemo vaše fotografije u portfoliju/mrežama."}
                    </div>
                  )}
                </div>
              ))}

            <LabeledNumber
              label="Sati posle ponoći (prelazak u drugi dan)"
              value={extraHours}
              setValue={setExtraHours}
              min={0}
              max={12}
              step={1}
              note="+60€/sat"
            />
          </div>
        </div>

        {/* rezultat / CTA */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-sm text-white/70">Orijentaciona cena</div>
            <div className="mt-1 text-3xl font-semibold">{price.toLocaleString("sr-RS")} €</div>
            <div className="mt-1 text-xs text-white/60">
              Prikaz zavisi od izabranog tipa proslave i dodataka. Za preciznu ponudu pošaljite upit.
            </div>
          </div>
          <div className="flex gap-3">
            <a href={continueHref} className="btn btn-primary" title="Nastavi ka formi za upit">
              Nastavi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ——— Util: promoviši “USB” iz extrasIncluded u pravilan addon (included) ——— */
function promoteUsbIncluded(json: any) {
  try {
    const cloned = structuredClone(json);
    const evs = Object.keys(cloned.extrasIncluded || {});
    for (const ev of evs) {
      const plans = Object.keys(cloned.extrasIncluded[ev] || {});
      for (const p of plans) {
        const arr: string[] = cloned.extrasIncluded[ev][p] || [];
        // nađi “USB” (case-insensitive)
        const idx = arr.findIndex((x) => x && x.toString().trim().toLowerCase() === "usb");
        if (idx !== -1) {
          // obezbedi granu u addons
          cloned.addons ||= {};
          cloned.addons[ev] ||= {};
          cloned.addons[ev][p] ||= {};
          // ako nema pravilo za usb – postavi kao included
          if (!cloned.addons[ev][p]["usb"]) {
            cloned.addons[ev][p]["usb"] = { state: "included" };
          }
          // ukloni iz extras, da ne dupliramo
          cloned.extrasIncluded[ev][p] = arr.filter((_, i) => i !== idx);
        }
      }
    }
    return cloned;
  } catch {
    return json;
  }
}

function priceNote(price: number, key: string) {
  if (key === "dontPublish") return "gratis";
  if (price > 0) return `+${price}€`;
  return undefined;
}

/* ——— UI helpers ——— */

function LabeledToggle({
  label, value, onChange, note,
}: { label: string; value: boolean; onChange: (v:boolean)=>void; note?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/0 px-3 py-2 transition hover:bg-white/[0.03]">
      <div>
        <div className="font-medium">{label}</div>
        {note && <div className="text-xs text-white/70">{note}</div>}
      </div>
      <input
        type="checkbox"
        className="h-5 w-5 accent-teal-400"
        checked={value}
        onChange={(e)=>onChange(e.target.checked)}
      />
    </label>
  );
}

function LabeledNumber({
  label, value, setValue, min=0, max=10, step=1, note,
}: { label: string; value: number; setValue: (n:number)=>void; min?: number; max?: number; step?: number; note?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="font-medium">{label}</div>
        {note && <div className="text-xs text-white/70">{note}</div>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e)=>setValue(Number(e.target.value))} className="w-full" />
        <input type="number" min={min} max={max} step={step} value={value} onChange={(e)=>setValue(Number(e.target.value))} className="w-20 rounded-md border border-white/10 bg-black/40 px-2 py-1" />
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-[2px]" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-[1px]" aria-hidden="true">
      <path d="M12 3l1.6 3.9L17.5 8 13.6 9.6 12 13.5 10.4 9.6 6.5 8l3.9-1.1L12 3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}