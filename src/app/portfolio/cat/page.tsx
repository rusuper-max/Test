import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FlipbookPageClient from "@/components/FlipbookPageClient";
import { notFound } from "next/navigation";
import { CAT_LABEL, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn } from "@/lib/listPublicImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: { cat: CatSlug }, searchParams: { from?: string } };

export function generateMetadata({ params }: Props) {
  const label = CAT_LABEL[params.cat];
  if (!label) return { title: "Portfolio | Studio Contrast" };
  return {
    title: `${label} — Portfolio | Studio Contrast`,
    description: `${label}: foto-album sa okretanjem stranica.`,
  };
}

export default function CategoryAlbumPage({ params, searchParams }: Props) {
  const cat = params.cat;
  const label = CAT_LABEL[cat];
  if (!label) return notFound();

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