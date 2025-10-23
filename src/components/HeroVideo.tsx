// src/components/HeroVideo.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Container from "./Container";

type Props = {
  veil?: boolean;   // beli filter preko videa
  center?: boolean; // true = tekst centriran; false = bottom-left
};

export default function HeroVideo({ veil = true, center = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [muted, playing]);

  const tryPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // mobile autoplay policy
    v.play().catch(() => {});
  };

  const overlay = veil
    ? "linear-gradient(to bottom, rgba(255,255,255,.26) 0%, rgba(0,0,0,.48) 60%, rgba(0,0,0,.85) 100%)"
    : "linear-gradient(to bottom, rgba(0,0,0,.10) 0%, rgba(0,0,0,.55) 70%, rgba(0,0,0,.82) 100%)";

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        poster="/hero/hero-poster.jpg"   // stavi fajl u /public/hero/
        crossOrigin="anonymous"
        onLoadedData={tryPlay}
        onCanPlay={tryPlay}
        onError={(e) => {
          const el = e.currentTarget as HTMLVideoElement;
          console.warn("Hero video error. Sources:",
            Array.from(el.querySelectorAll("source")).map(s => (s as HTMLSourceElement).src));
        }}
      >
        <source src="/hero/hero.webm" type="video/webm" />
        <source src="/hero/hero.mp4" type="video/mp4" />
      </video>

      {/* overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: overlay }} />

      {/* copy blok */}
      {center ? (
        <Container className="relative z-[2] flex min-h-[88vh] items-center justify-center text-center">
          <div className="max-w-3xl">
            <span className="kicker mx-auto">Foto + video za venčanja i proslave</span>
            <h1 className="mt-4 font-serif text-[clamp(34px,6vw,66px)] font-bold leading-tight">
              Uhvatimo trenutke <span className="text-accent-grad">koji ostaju zauvek</span>
            </h1>
            <p className="lead mx-auto mt-3 max-w-2xl">
              Prirodno i nenametljivo. Isporučujemo i kolor i crno-belo — onako kako najbolje priča vašu priču.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/portfolio" className="btn btn-outline">Portfolio</Link>
              <Link href="/kontakt" className="btn btn-primary">Pošalji upit</Link>
            </div>
          </div>
        </Container>
      ) : (
        <Container className="relative z-[2] flex min-h-[88vh] flex-col justify-end pb-14 text-left md:pb-20">
          <span className="kicker">Foto + video za venčanja i proslave</span>
          <h1 className="mt-4 font-serif text-[clamp(34px,6vw,66px)] font-bold leading-tight">
            Uhvatimo trenutke <span className="text-accent-grad">koji ostaju zauvek</span>
          </h1>
          <p className="lead mt-3 max-w-xl">
            Prirodno i nenametljivo. Isporučujemo i kolor i crno-belo — onako kako najbolje priča vašu priču.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/portfolio" className="btn btn-outline">Portfolio</Link>
            <Link href="/kontakt" className="btn btn-primary">Pošalji upit</Link>
          </div>
        </Container>
      )}

      {/* kontrole */}
      <div className="absolute bottom-4 right-4 z-[3] flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-2 py-1 text-xs backdrop-blur">
        <button onClick={() => setMuted((m) => !m)} className="rounded-full px-2 py-1 hover:bg-white/10">
          {muted ? "🔇" : "🔊"}
        </button>
        <button onClick={() => setPlaying((p) => !p)} className="rounded-full px-2 py-1 hover:bg-white/10">
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </section>
  );
}