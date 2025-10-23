import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FlipbookPageClient from "@/components/FlipbookPageClient";
import { notFound } from "next/navigation";
import { CAT_LABEL, isCatSlug, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn } from "@/lib/listPublicImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: { cat: string }, searchParams: { from?: string } };

export function generateMetadata({ params }: Props) {
  const raw = params.cat;
  const cat = isCatSlug(raw) ? (raw as CatSlug) : null;
  const label = cat ? CAT_LABEL[cat] : null;

  return label
    ? {
        title: `${label} — Portfolio | Studio Contrast`,
        description: `${label}: foto-album sa okretanjem stranica.`,
      }
    : { title: "Portfolio | Studio Contrast" };
}

export default function CategoryAlbumPage({ params, searchParams }: Props) {
  const raw = params.cat;
  if (!isCatSlug(raw)) return notFound();
  const cat = raw as CatSlug;

  const items = listPublicImagesIn(cat);
  if (!items.length) return notFound();

  const fromHome = searchParams?.from === "home";
  const backHref = fromHome ? "/?restore=1" : "/portfolio";
  const fullHref = `/portfolio/${cat}/full${fromHome ? "?from=home" : ""}`;

  return (
    <>
      <Navbar />
      <FlipbookPageClient items={items} backHref={backHref} fullHref={fullHref} />
      <Footer />
    </>
  );
}