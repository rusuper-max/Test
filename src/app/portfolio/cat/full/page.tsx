import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import GalleryGrid from "@/components/GalleryGrid";
import { notFound } from "next/navigation";
import { CAT_LABEL, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn } from "@/lib/listPublicImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: { cat: CatSlug }, searchParams: { from?: string } };

export function generateMetadata({ params }: Props) {
  const label = CAT_LABEL[params.cat];
  if (!label) return { title: "Kompletan portfolio | Studio Contrast" };
  return {
    title: `Kompletan portfolio — ${label} | Studio Contrast`,
    description: `Pregled u punoj veličini: ${label}. Kliknite na fotografiju za uvećanje.`,
  };
}

export default function CategoryFullPage({ params, searchParams }: Props) {
  const cat = params.cat;
  const label = CAT_LABEL[cat];
  if (!label) return notFound();

  const items = listPublicImagesIn(cat);
  if (!items.length) return notFound();

  const fromHome = searchParams?.from === "home";
  const backToAlbum = `/portfolio/${cat}${fromHome ? "?from=home" : ""}`;

  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <a href={backToAlbum} className="navlink navlink--accent">← Nazad na album</a>
            <div className="label-gold">{label}</div>
          </div>

          <h1 className="font-serif text-2xl font-semibold md:text-4xl">
            Kompletan portfolio — {label}
          </h1>
          <p className="mt-2 text-white/80">
            Kliknite na fotografiju za prikaz u punoj veličini. U lightbox-u koristite strelice, ESC,
            ili dugmad za preuzimanje / otvaranje originala.
          </p>

          <div className="mt-8">
            <GalleryGrid items={items} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}