// src/data/portfolio.ts

export type CatSlug =
  | "crno-belo"
  | "krstenja"
  | "portret"
  | "rodjendani"
  | "svadbe"
  | "vencanje";

export const CAT_LABEL: Record<CatSlug, string> = {
  "crno-belo": "Crno-belo",
  krstenja: "Krštenja",
  portret: "Portret",
  rodjendani: "Rođendani",
  svadbe: "Svadbe",
  vencanje: "Venčanje",
};

// redosled kartica/tabova
export const CAT_ORDER: readonly CatSlug[] = [
  "crno-belo",
  "krstenja",
  "portret",
  "rodjendani",
  "svadbe",
  "vencanje",
] as const;

export const isCatSlug = (s: string): s is CatSlug =>
  (CAT_ORDER as readonly string[]).includes(s);

// fallback na "vencanje" ako je slug nevažeći
export const normalizeCat = (s: string): CatSlug =>
  isCatSlug(s) ? (s as CatSlug) : "vencanje";

export const ALL_CATS = CAT_ORDER as readonly CatSlug[];