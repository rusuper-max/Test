import Container from "./Container";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10">
        <div className="h-[60vh] w-full bg-gradient-to-b from-black via-neutral-800 to-white" />
      </div>
      <Container className="flex h-[60vh] flex-col items-start justify-center">
        <span className="mb-3 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
          Foto + Video za venčanja i proslave
        </span>
        <p className="mb-1 text-sm text-white/80">Studio Contrast</p>
        <h1 className="max-w-2xl text-4xl font-bold text-white md:text-6xl">
          Uhvatimo emociju <span className="text-teal-400">koja traje zauvek</span>
        </h1>
        <p className="mt-4 max-w-xl text-white/90">
          Pričamo vašu priču kroz nežne kadrove, filmski ton i diskretan pristup.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/kontakt" className="rounded-xl bg-black/80 px-5 py-3 text-white text-sm">
            Zakaži termin
          </Link>
          <Link href="/portfolio" className="rounded-xl border border-white/70 px-5 py-3 text-white text-sm">
            Pogledaj radove
          </Link>
        </div>
      </Container>
    </section>
  );
}
