// src/components/Navbar.tsx
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "./Container";

type PlanSlug = "basic" | "classic" | "signature";

/** Fallback (usklađen: “Studio” umesto “Portret”, nema “Drugo”) */
const FALLBACK_EVENTS = ["Svadba", "Venčanje", "Studio", "Rođendani", "Krštenja"] as const;

const rightNav = [
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];

/** Paketi + boje */
const OFFERS: readonly {
  slug: PlanSlug;
  name: string;
  color: string; // akcent za hover
  wipe: string;  // levo→desno wipe
}[] = [
  {
    slug: "basic",
    name: "Standard",
    color: "rgba(229,231,235,.85)",
    wipe: "linear-gradient(90deg, rgba(229,231,235,.35), rgba(203,213,225,.25))",
  },
  {
    slug: "classic",
    name: "Premium",
    color: "rgba(245,208,66,.85)",
    wipe: "linear-gradient(90deg, rgba(245,208,66,.35), rgba(190,147,20,.25))",
  },
  {
    slug: "signature",
    name: "Signature",
    color: "rgba(45,212,191,.85)",
    wipe: "linear-gradient(90deg, rgba(94,234,212,.35), rgba(20,184,166,.25))",
  },
] as const;

/** FIKS širina jedne pločice (paket i event pločice jednako široke) */
const TILE_W = 240; // px

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [hoverPlan, setHoverPlan] = useState<PlanSlug>("basic");
  const [events, setEvents] = useState<string[]>([...FALLBACK_EVENTS]);
  const closeTimerRef = useRef<number | null>(null);

  // učitaj tipove proslave iz API-ja (ako postoji)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/inquiry/addons?onlyTypes=1", { cache: "no-store" });
        const data = res.ok ? await res.json() : null;
        const list: string[] | undefined = data?.eventTypes || data?.event_types || data?.types;
        if (!cancelled && Array.isArray(list) && list.length) setEvents(list);
      } catch {
        /* fallback ostaje */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openOffers = () => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    setOffersOpen(true);
  };
  const scheduleCloseOffers = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setOffersOpen(false), 180);
  };

  const activeOffer = OFFERS.find(o => o.slug === hoverPlan) || OFFERS[0];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur">
      {/* Desktop */}
      <Container className="hidden h-16 items-center justify-between md:grid md:grid-cols-3">
        {/* LEFT NAV */}
        <nav className="flex items-center gap-6">
          <Link href="/portfolio" className="navlink navlink--accent text-sm inline-flex items-center">
            Portfolio
          </Link>

          {/* Ponude — mega dropdown (levo paketi, desno vidovi) */}
          <div
            className="relative inline-block"
            onMouseEnter={openOffers}
            onMouseLeave={scheduleCloseOffers}
          >
            <Link href="/ponude" className="navlink navlink--accent text-sm inline-flex items-center">
              Ponude <span className="ml-1 text-white/70">▾</span>
            </Link>

            {offersOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-0 overflow-visible rounded-2xl border border-white/10 bg-black/80 p-2 shadow-2xl shadow-black/50 backdrop-blur"
                role="menu"
                style={
                  {
                    // širina = 1 kolona paketa + most + 2 kolone eventa + unutrašnji gapovi
                    minWidth: `${TILE_W + 8 + (TILE_W * 2 + 8) + 16}px`,
                    ["--accentColor" as any]: activeOffer.color,
                  } as React.CSSProperties
                }
              >
                {/* uvek u JEDNOM redu */}
                <div className="flex flex-nowrap items-stretch gap-2">
                  {/* Levo: paketi (fiksna širina) */}
                  <div className="shrink-0 rounded-xl border border-white/10 p-1" style={{ width: TILE_W }}>
                    {OFFERS.map((o) => {
                      const active = hoverPlan === o.slug;
                      return (
                        <button
                          key={o.slug}
                          onMouseEnter={() => setHoverPlan(o.slug)}
                          className="offer-item relative block w/full overflow-hidden rounded-lg px-3 py-2 text-left text-sm text-white/85 transition hover:text-white focus:outline-none"
                          title={o.name}
                          aria-pressed={active}
                          style={{
                            boxShadow: active ? `inset 0 0 0 1px ${o.color}` : "none",
                            border: active ? `1px solid rgba(255,255,255,0.12)` : "1px solid transparent",
                          }}
                        >
                          <span
                            className="color-wipe pointer-events-none absolute inset-0 z-0 opacity-0"
                            style={{ background: o.wipe }}
                          />
                          <span className="relative z-10 flex items-center justify-between">
                            {o.name}
                            <span className="text-white/40 transition-transform">→</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* mali “most” da prelaz miša ne prekine meni */}
                  <div className="w-2 shrink-0" />

                  {/* Desno: vidovi (svaka pločica tačno kao levo: TILE_W) */}
                  <div className="shrink-0 rounded-xl border border-white/10 p-2">
                    <div className="px-2 pb-1 text-xs text-white/60">Odaberite vid proslave</div>
                    <ul
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(2, ${TILE_W}px)`,
                        gap: "8px",
                      }}
                    >
                      {events.map((ev) => (
                        <li key={ev}>
                          <Link
                            href={`/ponude?plan=${activeOffer.slug}&type=${encodeURIComponent(ev)}`}
                            className="event-link group relative block overflow-hidden rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/85 transition"
                            title={`${activeOffer.name} — ${ev}`}
                          >
                            <span className="relative z-10 flex items-center justify-between">
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className="inline-block h-1.5 w-1.5 rounded-full"
                                  style={{ background: "var(--accentColor)" }}
                                />
                                {ev}
                              </span>
                              <span className="text-white/40 transition-transform group-hover:translate-x-0.5">→</span>
                            </span>

                            {/* hover aura — sada ide DO SAME IVICE ( -inset-px ) */}
                            <span
                              className="hover-fill pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                              style={{
                                background:
                                  "radial-gradient(80% 80% at 50% 0%, rgba(255,255,255,.08), rgba(255,255,255,0))",
                              }}
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/onama" className="navlink navlink--accent text-sm inline-flex items-center">
            O nama
          </Link>
        </nav>

        {/* Brand u sredini */}
        <div className="flex items-center justify-center">
          <Link href="/" className="brand-logo relative inline-flex items-center justify-center px-4 py-1 focus:outline-none">
            <span className="font-serif text-xl md:text-2xl leading-none">
              <span className="brand-part">Studio</span>{" "}
              <span className="brand-part">Contrast</span>
            </span>
          </Link>
        </div>

        {/* RIGHT NAV + CTA */}
        <div className="flex items-center justify-end gap-6">
          {rightNav.map((i) => (
            <Link key={i.href} href={i.href} className="navlink navlink--accent text-sm inline-flex items-center">
              {i.label}
            </Link>
          ))}
          <Link href="/upit" className="btn btn-primary">Pošalji upit</Link>
        </div>
      </Container>

      {/* Mobile */}
      <Container className="flex h-16 items-center justify-between md:hidden">
        <Link href="/" className="font-serif text-lg">
          Studio <span className="text-accent-grad">Contrast</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/90"
          aria-label="Menu"
        >
          Meni
        </button>
      </Container>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/85 backdrop-blur">
          <Container className="flex flex-col gap-2 py-3">
            <Link href="/portfolio" className="py-2 text-white/90 hover:text-white" onClick={() => setOpen(false)}>
              Portfolio
            </Link>
            <Link href="/ponude" className="py-2 text-white/90 hover:text-white" onClick={() => setOpen(false)}>
              Ponude
            </Link>
            <Link href="/onama" className="py-2 text-white/90 hover:text-white" onClick={() => setOpen(false)}>
              O nama
            </Link>
            <Link href="/faq" className="py-2 text-white/90 hover:text-white" onClick={() => setOpen(false)}>
              FAQ
            </Link>
            <Link href="/kontakt" className="py-2 text-white/90 hover:text-white" onClick={() => setOpen(false)}>
              Kontakt
            </Link>
            <Link href="/upit" onClick={() => setOpen(false)} className="btn btn-primary w-full">
              Pošalji upit
            </Link>
          </Container>
        </div>
      )}

      {/* Lokalni stil: wipe i hover akcenti */}
      <style>{`
        .offer-item .color-wipe {
          transform-origin: left;
          transform: scaleX(0);
          transition: transform .35s ease, opacity .2s ease;
        }
        .offer-item:hover .color-wipe {
          transform: scaleX(1);
          opacity: 1;
        }
        .events-panel .event-link:hover,
        .event-link:hover {
          border-color: var(--accentColor);
          box-shadow: inset 0 0 0 1px var(--accentColor);
          color: var(--accentColor);
        }
      `}</style>
    </header>
  );
}