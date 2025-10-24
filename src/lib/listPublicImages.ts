// src/lib/listPublicImages.ts
import { PORTFOLIO_MANIFEST, type PortfolioCat } from "@/data/portfolioManifest";

export type PublicImage = { src: string };

/** Vrati slike za konkretnu kategoriju iz manifest-a */
export function listPublicImagesIn(cat: PortfolioCat): PublicImage[] {
  const files = PORTFOLIO_MANIFEST[cat] ?? [];
  return files.map((name) => ({ src: `/portfolio/${cat}/${name}` }));
}

/** Ako ti negde treba lista svih kategorija koje postoje u manifestu */
export function listPortfolioCats(): PortfolioCat[] {
  return Object.keys(PORTFOLIO_MANIFEST) as PortfolioCat[];
}