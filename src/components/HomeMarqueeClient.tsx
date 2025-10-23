"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CatSlug } from "@/data/portfolio";
import { deco } from "@/lib/fonts";

type MarqueeItem = {
  slug: CatSlug;
  label: string;
  images: string[];
};

export default function HomeMarqueeClient({
  items,
  baseIntervalMs = 4200,
  staggerMs = 500,
  marqueeSpeedSec = 28,
}: {
  items: MarqueeItem[];
  baseIntervalMs?: number;
  staggerMs?: number;
  marqueeSpeedSec?: number;
}) {
  // Dupliramo niz za "beskonačan" klizač
  const loop = useMemo(() => [...items, ...items], [items]);

  return (
    <div className="relative mx-auto w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black via-black/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black via-black/40 to-transparent" />

      <div className="group">
        <div
          className="marquee-track"
          style={{ animationDuration: `${marqueeSpeedSec}s` }}
        >
          {loop.map((it, i) => (
            <Card
              key={`${it.slug}-${i}`}
              item={it}
              // svaki “slide” ima mali offset da ne menjaju sve u isto vreme
              intervalMs={baseIntervalMs + ((i % 3) * staggerMs)}
              startDelayMs={i * (staggerMs / 2)}
            />
          ))}
        </div>
      </div>

      <style>{`
        .marquee-track {
          display: flex;
          gap: 1rem;
          width: max-content;
          animation-name: marqueeSlide;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .group:hover .marquee-track { animation-play-state: paused; }

        @keyframes marqueeSlide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee-card {
          position: relative;
          display: block;
          width: clamp(240px, 32vw, 360px);
          aspect-ratio: 16 / 10;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(0,0,0,.40);
          transition: transform .45s ease, box-shadow .45s ease, border-color .3s ease;
        }
        .marquee-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 28px 70px rgba(0,0,0,.45);
          border-color: rgba(255,255,255,.18);
        }

        /* FADE STACK */
        .marquee-stack { position: absolute; inset: 0; }
        .marquee-layer {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          filter: contrast(1.02) saturate(1.02);
          transform: scale(1.01);
          opacity: 0;
          transition: opacity 700ms ease; /* crossfade */
        }
        .marquee-layer.is-active { opacity: 1; }

        .marquee-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.25));
          pointer-events: none;
        }
        .marquee-caption {
          position: absolute; left: 0; right: 0; bottom: 0;
          padding: 14px 16px; text-align: center;
        }
      `}</style>
    </div>
  );
}

function Card({
  item,
  intervalMs,
  startDelayMs,
}: {
  item: MarqueeItem;
  intervalMs: number;
  startDelayMs: number;
}) {
  const [idx, setIdx] = useState(0);
  const imgs = item.images?.length ? item.images : ["/hero/hero.webp"];
  const total = imgs.length;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // blagi start delay po kartici — desinhronizacija
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setIdx((i) => (i + 1) % total);
      }, intervalMs);
    }, startDelayMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, startDelayMs, total]);

  return (
    <Link
      href={`/portfolio/${item.slug}?from=home`}
      className="marquee-card"
      aria-label={`${item.label} — otvori album`}
      onClick={() => {
        try {
          sessionStorage.setItem("home:scrollY", String(window.scrollY));
        } catch {}
      }}
    >
      <div className="marquee-stack" aria-hidden="true">
        {imgs.map((src, j) => (
          <div
            key={j}
            className={`marquee-layer ${j === idx ? "is-active" : ""}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>

      <div className="marquee-overlay" />
      <div className="marquee-caption">
        <div className={`${deco.className} label-accent`}>{item.label}</div>
        <div className="mt-1 text-sm text-white/80">Kliknite za foto-album</div>
      </div>
    </Link>
  );
}