"use client";

import { useState } from "react";
import { fancy } from "@/lib/fonts";

/**
 * Boje po paketu — stavi svoje (HEX / rgb / hsl)
 * Primeri su samo da vidiš efekat.
 */
type PlanId = "svadba" | "vencanje" | "portret" | "rodjendan" | "krstenja";

type Plan = {
  id: PlanId;
  title: string;
  price: string;
  color: string;       // koristi se za outline/tekst kad je selektovan (CSS var)
  features: string[];
  cta?: string;
};

const PLANS: Plan[] = [
  {
    id: "svadba",
    title: "Svadba",
    price: "od 900€",
    color: "#8B5CF6", // ljubičasta
    features: ["Ceo dan", "2 fotografa", "Album 30x30", "Online galerija"],
    cta: "Izaberi Svadbu",
  },
  {
    id: "vencanje",
    title: "Venčanje",
    price: "od 1200€",
    color: "#06B6D4", // teal
    features: ["Ceo dan + video", "2 fotografa", "Foto knjiga", "Online galerija"],
    cta: "Izaberi Venčanje",
  },
  {
    id: "portret",
    title: "Portret",
    price: "od 150€",
    color: "#F59E0B", // narandžasta
    features: ["Studijski / outdoor", "Retuš 10 fotki", "Online isporuka"],
    cta: "Izaberi Portret",
  },
  {
    id: "rodjendan",
    title: "Rođendan",
    price: "od 180€",
    color: "#22C55E", // zelena
    features: ["Do 3h snimanja", "50+ obrađenih fotki", "Online galerija"],
    cta: "Izaberi Rođendan",
  },
  {
    id: "krstenja",
    title: "Krštenja",
    price: "od 220€",
    color: "#E11D48", // ružičasta/crvena
    features: ["Crkveni obred", "Porodične fotografije", "Online galerija"],
    cta: "Izaberi Krštenja",
  },
];

export default function PricingSection({
  highlightTextToo = true,  // ako je true — ofarba i naslov/cenu u boju paketa kada je selektovan
  initialSelected,
}: {
  highlightTextToo?: boolean;
  initialSelected?: PlanId;
}) {
  const [selected, setSelected] = useState<PlanId | null>(initialSelected ?? null);

  return (
    <section className="section">
      <div className="text-center mb-8">
        <h2 className={`${fancy.className} text-accent-grad select-none text-4xl leading-none md:text-5xl`}>
          Naši paketi
        </h2>
        <p className="lead mx-auto mt-3 max-w-2xl">
          Izaberite paket koji vam najviše odgovara. Klikom na karticu ističemo boju paketa.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((p) => {
          const isActive = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(isActive ? null : p.id)}
              aria-pressed={isActive}
              style={{ ["--card-accent" as any]: p.color }}
              className={[
                "group relative flex flex-col rounded-2xl border bg-black/40 p-5 text-left transition",
                "border-white/15 hover:border-white/25",
                isActive && "border-[var(--card-accent)] shadow-[0_0_0_2px_var(--card-accent)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--card-accent)]",
              ].filter(Boolean).join(" ")}
            >
              {/* Akcent-bar na vrhu kad je selektovan */}
              <span
                className={[
                  "pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-0 transition",
                  isActive && "opacity-100",
                ].join(" ")}
                style={{ background: "var(--card-accent)" }}
              />

              <div className="mb-2 flex items-center justify-between">
                <span
                  className={[
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs transition",
                    isActive ? "border-[var(--card-accent)] text-[var(--card-accent)]" : "border-white/20 text-white/70",
                  ].join(" ")}
                >
                  {p.title}
                </span>
                <span
                  className={[
                    "text-sm font-medium transition",
                    isActive && highlightTextToo ? "text-[var(--card-accent)]" : "text-white/80",
                  ].join(" ")}
                >
                  {p.price}
                </span>
              </div>

              <ul className="mt-3 grid gap-2 text-sm text-white/80">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className={[
                        "mt-1 inline-block h-1.5 w-1.5 rounded-full",
                        isActive ? "bg-[var(--card-accent)]" : "bg-white/40",
                      ].join(" ")}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between">
                <span
                  className={[
                    "text-xs transition",
                    isActive && highlightTextToo ? "text-[var(--card-accent)]" : "text-white/60",
                  ].join(" ")}
                >
                  Kliknite da {isActive ? "poništite izbor" : "odaberete paket"}
                </span>
                <span
                  className={[
                    "rounded-xl border px-3 py-1.5 text-sm transition",
                    isActive
                      ? "border-[var(--card-accent)] text-[var(--card-accent)] bg-[color:color-mix(in_oklab,var(--card-accent)_14%,transparent)]"
                      : "border-white/15 text-white/90 bg-white/5 group-hover:bg-white/10",
                  ].join(" ")}
                >
                  {p.cta ?? "Izaberi"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}