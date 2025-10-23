// src/components/PackageCards.tsx
"use client";

import { useMemo } from "react";
import { HOME_PACKAGES } from "@/data/homePackages";
import { PLANS, type PlanSlug } from "@/data/packages";
import { useMinPricePerPlan } from "@/data/eventPricing";

export default function PackageCards() {
  const order: PlanSlug[] = ["basic", "classic", "signature"];

  // “Počev od” – apsolutni minimum po planu (preko svih tipova proslava)
  const fromByPlan = useMinPricePerPlan();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {order.map((slug) => {
        const p = HOME_PACKAGES[slug];
        const fromPrice = fromByPlan[slug];

        return (
          <a
            key={slug}
            href={`/ponude?plan=${slug}`}
            className={`pkg-card card-${slug} relative block overflow-hidden rounded-2xl border border-white/10 bg-black/40 transition
                      hover:shadow-2xl hover:shadow-black/40 isolate`}
          >
            {/* Hover overlay (iznad pozadine, ispod sadržaja) */}
            <span className="hover-aura absolute inset-0 z-0 opacity-0 transition-opacity duration-500" />
            {/* Edge glow pri vrhu */}
            <span className="hover-glow absolute inset-x-0 top-0 z-0 h-24 translate-y-[-1px] opacity-0 blur-md transition-opacity duration-500" />

            {/* Sadržaj */}
            <div className="relative z-10 p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <div className="price-badge rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/80 transition">
                  Počev od {fromPrice.toLocaleString("sr-RS")} €
                </div>
              </div>

              <p className="mt-1 text-white/70">{p.blurb}</p>

              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {p.bullets.map((line, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="dot inline-block h-1.5 w-1.5 rounded-full bg-white/40 transition" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 inline-flex items-center gap-2 text-sm text-accent-300/90 transition">
                Konfiguriši paket
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </div>
            </div>

            {/* Stilovi specifični po paketu — identično tvom starom ponašanju */}
            <style>{`
              /* Opšti hover ponašanje */
              .pkg-card:hover .hover-aura,
              .pkg-card:hover .hover-glow { opacity: 1; }
              .pkg-card:hover { border-color: rgba(255,255,255,.18); }

              /* ——— BASIC (srebrni) ——— */
              .card-basic .hover-aura {
                background:
                  radial-gradient(120% 120% at 50% 0%,
                    rgba(229,231,235,0.32) 0%,
                    rgba(203,213,225,0.18) 30%,
                    rgba(0,0,0,0) 70%);
              }
              .card-basic .hover-glow {
                background: linear-gradient(180deg, rgba(229,231,235,.45), rgba(255,255,255,0));
              }
              .card-basic:hover { border-color: rgba(229,231,235,.45); }
              .card-basic:hover .price-badge { border-color: rgba(229,231,235,.45); color: rgba(255,255,255,.9); }
              .card-basic:hover .dot { background: rgba(229,231,235,.85); }

              /* ——— CLASSIC (zlatni) ——— */
              .card-classic .hover-aura {
                background:
                  radial-gradient(120% 120% at 50% 0%,
                    rgba(245,208,66,0.32) 0%,
                    rgba(190,147,20,0.22) 30%,
                    rgba(0,0,0,0) 70%);
              }
              .card-classic .hover-glow {
                background: linear-gradient(180deg, rgba(255,227,134,.55), rgba(255,255,255,0));
              }
              .card-classic:hover { border-color: rgba(245,208,66,.55); }
              .card-classic:hover .price-badge { border-color: rgba(245,208,66,.55); color: rgba(255,255,255,.92); }
              .card-classic:hover .dot { background: rgba(245,208,66,.9); }

              /* ——— SIGNATURE (teal) ——— */
              .card-signature .hover-aura {
                background:
                  radial-gradient(120% 120% at 50% 0%,
                    rgba(20,184,166,0.26) 0%,
                    rgba(13,148,136,0.18) 30%,
                    rgba(0,0,0,0) 70%);
              }
              .card-signature .hover-glow {
                background: linear-gradient(180deg, rgba(94,234,212,.55), rgba(255,255,255,0));
              }
              .card-signature:hover { border-color: rgba(45,212,191,.55); }
              .card-signature:hover .price-badge { border-color: rgba(45,212,191,.55); color: rgba(255,255,255,.94); }
              .card-signature:hover .dot { background: rgba(45,212,191,.9); }
            `}</style>
          </a>
        );
      })}
    </div>
  );
}