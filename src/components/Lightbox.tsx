"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Img = string | { src: string; alt?: string };

export default function Lightbox({
  items,
  initial = 0,
  onClose,
}: {
  items: Img[];
  initial?: number;
  onClose?: () => void;
}) {
  const normalized = useMemo(
    () =>
      items.map((it, i) =>
        typeof it === "string"
          ? { src: it, alt: `image ${i + 1}` }
          : { src: it.src, alt: it.alt ?? `image ${i + 1}` }
      ),
    [items]
  );

  const clamp = (n: number) => Math.min(Math.max(n, 0), normalized.length - 1);
  const [idx, setIdx] = useState(clamp(initial));
  const cur = normalized[idx];

  const prev = () => setIdx((i) => (i > 0 ? i - 1 : normalized.length - 1));
  const next = () => setIdx((i) => (i < normalized.length - 1 ? i + 1 : 0));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose ? onClose() : history.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, normalized.length]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95">
      {/* Gornja traka: Nazad + Otvori original */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 py-3">
        <div className="pointer-events-auto">
          <button
            onClick={() => (onClose ? onClose() : history.back())}
            className="rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur transition hover:bg-white/20"
          >
            ← Nazad
          </button>
        </div>
        <div className="pointer-events-auto">
          <a
            href={cur?.src ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur transition hover:bg-white/20"
          >
            Otvori original
          </a>
        </div>
      </div>

      {/* Centrirana kutija — još manja: 66vh i max 960px */}
      <div className="absolute inset-0 grid place-items-center px-4 pt-14 pb-4">
        <div className="relative h-[66vh] w-full max-w-[960px]">
          {cur && (
            <Image
              src={cur.src}
              alt={cur.alt ?? ""}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 92vw, 960px"
              priority
            />
          )}
        </div>

        {/* Vidljivi tasteri za navigaciju + klik zone */}
        {normalized.length > 1 && (
          <>
            {/* klik zone */}
            <button
              aria-label="Prethodna"
              onClick={prev}
              className="absolute left-0 top-14 bottom-0 w-1/3 bg-transparent"
            />
            <button
              aria-label="Sledeća"
              onClick={next}
              className="absolute right-0 top-14 bottom-0 w-1/3 bg-transparent"
            />

            {/* strelice (vizuelno) */}
            <button
              aria-label="Prethodna"
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-xl text-white backdrop-blur transition hover:bg-white/20"
            >
              ‹
            </button>
            <button
              aria-label="Sledeća"
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-xl text-white backdrop-blur transition hover:bg-white/20"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}