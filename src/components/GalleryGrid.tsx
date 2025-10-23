"use client";
import Image from "next/image";
import { useState } from "react";
import Lightbox from "./Lightbox";

export type GalleryItem = { src: string; alt?: string };

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items?.length) {
    return (
      <p className="text-sm text-neutral-400">
        Nema stavki u galeriji. Dodaj slike u <code>/public/photos</code>.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it, i) => (
          <div key={i} className="group">
            {/* 4:3 placeholder preko padding-bottom trika */}
            <div className="relative h-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 pb-[75%]">
              <Image
                src={it.src}
                alt={it.alt ?? `Foto ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={i < 4}
              />
              <button
                onClick={() => setOpenIndex(i)}
                aria-label={`Otvori ${it.alt ?? `fotku ${i + 1}`}`}
                className="absolute inset-0 cursor-zoom-in"
              />
            </div>
          </div>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          items={items}
          initial={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}