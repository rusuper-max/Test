import { CAT_ORDER, CAT_LABEL, type CatSlug } from "@/data/portfolio";
import { listPublicImagesIn } from "@/lib/listPublicImages";
import HomeMarqueeClient from "./HomeMarqueeClient";

export default function HomeMarquee() {
  // Uzmemo do 8 slika po kategoriji (možeš menjati limit)
  const items = CAT_ORDER.flatMap((cat: CatSlug) => {
    const raw = listPublicImagesIn(cat);
    if (!raw?.length) return [];

    const images = raw
      .slice(0, 8)
      .map((it: any) => (typeof it === "string" ? it : it?.src))
      .filter(Boolean) as string[];

    if (!images.length) return [];
    return [{ slug: cat, label: CAT_LABEL[cat], images }];
  });

  if (!items.length) return null;

  return (
    <HomeMarqueeClient
      items={items}
      baseIntervalMs={4200}  // baza za promenu slike po kartici
      staggerMs={500}        // kašnjenje po kartici (desinhronizacija)
      marqueeSpeedSec={28}   // brzina vodoravnog marquee-a
    />
  );
}