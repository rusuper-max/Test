import Link from "next/link";
import Container from "./Container";

export default function HeroImage() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage: "url(/hero/hero.webp)", // stavi sliku u: public/hero/hero.webp
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay radi čitljivosti */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,.22) 0%, rgba(0,0,0,.55) 55%, rgba(0,0,0,.78) 100%)",
        }}
      />

      <Container className="relative z-10 flex min-h-[78vh] flex-col justify-end pb-14 md:min-h-[86vh] md:pb-20">
        <span className="kicker">Foto + video za venčanja i proslave</span>

        <h1 className="mt-4 font-serif text-[clamp(34px,6vw,66px)] font-bold leading-tight">
          Uhvatimo trenutke <span className="text-[var(--accent)]">koji ostaju zauvek</span>
        </h1>

        <p className="lead mt-3 max-w-xl">
          Prirodno i nenametljivo. Isporučujemo i kolor i crno-belo — onako kako najbolje
          priča vašu priču.
        </p>

        <div className="mt-6 flex gap-3">
          <Link href="/portfolio" className="btn btn-outline">Portfolio</Link>
          <Link href="/kontakt" className="btn btn-primary">Pošalji upit</Link>
        </div>
      </Container>
    </section>
  );
}