"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const SERVICES = [
  "Venčanja",
  "Svadbe",
  "Veridbe",
  "Rođendani",
  "Krštenja",
  "Mature",
  "Korporativne proslave",
];

export default function StickyServiceBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = typeof window !== "undefined" && localStorage.getItem("sc_bar_dismissed") === "1";
    if (!dismissed) {
      const t = setTimeout(() => setOpen(true), 900); // kratko kašnjenje da ne “iskače” odmah
      return () => clearTimeout(t);
    }
  }, []);

  if (!open) return null;

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem("sc_bar_dismissed", "1"); } catch {}
  };

  return (
    <div
      className="
        fixed inset-x-3 bottom-3 z-40
        rounded-2xl border border-white/15 bg-black/70
        backdrop-blur px-3 py-2 md:px-4 md:py-3
        shadow-[0_10px_30px_rgba(0,0,0,.45)]
      "
      role="region" aria-label="Vrste proslava"
    >
      <div className="flex items-center gap-2 md:gap-3">
        {/* skrolujući spisak chip-ova */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 md:gap-3">
            {SERVICES.map((s) => (
              <span
                key={s}
                className="
                  whitespace-nowrap rounded-full
                  border border-white/20
                  bg-black/30 px-3 py-1.5 text-xs md:text-sm
                  text-white/90 hover:bg-white/10
                "
                title={s}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/kontakt"
          className="btn btn-primary whitespace-nowrap"
          aria-label="Pošalji upit"
        >
          Pošalji upit
        </Link>

        {/* close */}
        <button
          onClick={dismiss}
          className="ml-1 rounded-full border border-white/20 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
          aria-label="Zatvori traku"
          title="Zatvori"
        >
          ✕
        </button>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}