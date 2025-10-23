"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import Container from "./Container";

const rightNav = [
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];

// Dropdown stavke sa left→right “wipe” bojom (staro ponašanje)
const OFFERS = [
  { slug: "basic",     name: "Standard",  wipe: "linear-gradient(90deg, rgba(229,231,235,.35), rgba(203,213,225,.25))" },
  { slug: "classic",   name: "Premium",   wipe: "linear-gradient(90deg, rgba(245,208,66,.35), rgba(190,147,20,.25))" },
  { slug: "signature", name: "Signature", wipe: "linear-gradient(90deg, rgba(94,234,212,.35), rgba(20,184,166,.25))" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const openOffers = () => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    setOffersOpen(true);
  };
  const scheduleCloseOffers = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setOffersOpen(false), 140);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur">
      {/* Desktop */}
      <Container className="hidden h-16 items-center justify-between md:grid md:grid-cols-3">
        {/* LEFT NAV */}
        <nav className="flex items-center gap-6">
          <Link href="/portfolio" className="navlink navlink--accent text-sm inline-flex items-center">
            Portfolio
          </Link>

          {/* Ponude (dropdown) */}
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
                className="absolute left-0 top-full z-50 mt-0 w-64 overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-1 shadow-2xl shadow-black/50 backdrop-blur"
                role="menu"
              >
                {OFFERS.map((o) => (
                  <Link
                    key={o.slug}
                    href={`/ponude?plan=${o.slug}`}
                    role="menuitem"
                    className="offer-item relative block overflow-hidden rounded-xl px-3 py-2 text-sm text-white/85 transition hover:text-white"
                    title={o.name}
                  >
                    {/* left→right color wipe (samo na hover) */}
                    <span
                      className="color-wipe pointer-events-none absolute inset-0 z-0 opacity-0"
                      style={{ background: o.wipe }}
                    />
                    <span className="relative z-10 flex items-center justify-between">
                      {o.name}
                      <span className="text-white/40 transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </Link>
                ))}
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

      {/* Lokalni stil: Wipe animacija u dropdownu (staro ponašanje) */}
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
      `}</style>
    </header>
  );
}