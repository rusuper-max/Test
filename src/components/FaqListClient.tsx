"use client";

import { useEffect, useState, type ReactNode } from "react";

export type FaqLite = { id: string; q: string; aJSX: ReactNode };

export default function FaqListClient({ items }: { items: FaqLite[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Aktivacija iz hash-a (klik iz "Brzi skok") + auto-open
  useEffect(() => {
    const applyFromHash = () => {
      const raw = typeof window !== "undefined" ? window.location.hash : "";
      const id = raw ? raw.slice(1) : null;
      setActiveId(id);
      if (id) {
        const el = document.getElementById(id) as HTMLDetailsElement | null;
        if (el && !el.open) el.open = true;
      }
    };
    applyFromHash();
    window.addEventListener("hashchange", applyFromHash);
    return () => window.removeEventListener("hashchange", applyFromHash);
  }, []);

  return (
    <div className="mx-auto mt-8 max-w-3xl">
      {items.map((f) => {
        const isActive = activeId === f.id;
        return (
          <details
            key={f.id}
            id={f.id}
            className={[
              "faq-item group mb-3 overflow-hidden rounded-2xl border border-white/10 bg-black/40",
              "scroll-mt-24 md:scroll-mt-28",
              isActive ? "is-active" : "",
            ].join(" ")}
            onToggle={(e) => {
              const open = (e.currentTarget as HTMLDetailsElement).open;
              if (open) {
                setActiveId(f.id);
                // Postavi hash na trenutno pitanje (bez nove istorije)
                if (typeof window !== "undefined") {
                  history.replaceState(null, "", `${window.location.pathname}#${f.id}`);
                }
              } else if (isActive) {
                setActiveId(null);
                if (typeof window !== "undefined") {
                  history.replaceState(null, "", window.location.pathname);
                }
              }
            }}
          >
            <summary
              className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3"
              onClick={() => {
                setActiveId(f.id);
                if (typeof window !== "undefined") {
                  history.replaceState(null, "", `${window.location.pathname}#${f.id}`);
                }
              }}
            >
              <span className="font-medium">{f.q}</span>
              <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/70 transition group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="px-4 pb-4 pt-1 text-white/85">{f.aJSX}</div>
          </details>
        );
      })}
    </div>
  );
}