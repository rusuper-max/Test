import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import GalleryGrid from "@/components/GalleryGrid";
import { notFound } from "next/navigation";
import { CAT_LABEL, isCatSlug, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn } from "@/lib/listPublicImages";
import { fancy } from "@/lib/fonts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: { cat: string }, searchParams: { from?: string } };

export function generateMetadata({ params }: Props) {
  const cat = isCatSlug(params.cat) ? (params.cat as CatSlug) : null;
  const label = cat ? CAT_LABEL[cat] : null;
  return label
    ? { title: `Kompletan portfolio — ${label} | Studio Contrast` }
    : { title: "Kompletan portfolio | Studio Contrast" };
}

export default function FullCategoryPage({ params }: Props) {
  if (!isCatSlug(params.cat)) return notFound();
  const cat = params.cat as CatSlug;

  const items = listPublicImagesIn(cat);
  if (!items.length) return notFound();

  const label = CAT_LABEL[cat];

  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          <div className="text-center">
            <h1 className={`${fancy.className} text-accent-grad select-none text-4xl leading-none md:text-5xl`}>
              {label}
            </h1>
            <p className="lead mx-auto mt-3 max-w-2xl">
              Kliknite na fotografiju za veći prikaz. U lightbox-u koristite strelice na tastaturi
              ili ESC. Za punu rezoluciju izaberite „Otvori original“.
            </p>
          </div>

          <div className="mt-8">
            <GalleryGrid items={items} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}