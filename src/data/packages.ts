export type PlanSlug = "basic" | "classic" | "signature";

export type Plan = {
  slug: PlanSlug;
  name: string;
  tagline: string;
  basePrice: number; // € bez PDV-a (primer)
  highlights: string[];
};

export const PLANS: Record<PlanSlug, Plan> = {
  basic: {
    slug: "basic",
    name: "Početni",
    tagline: "Za manje proslave i intimne događaje",
    basePrice: 500,
    highlights: [
      "1 fotograf",
      "Do 4 sata pokrivanja",
      "30+ obrađenih fotografija",
    ],
  },
  classic: {
    slug: "classic",
    name: "Standard",
    tagline: "Klasično celodnevno pokrivanje",
    basePrice: 900,
    highlights: [
      "1 fotograf",
      "Do 8 sati pokrivanja",
      "120+ obrađenih fotografija",
    ],
  },
  signature: {
    slug: "signature",
    name: "Signature",
    tagline: "Za premium doživljaj i kompletan paket",
    basePrice: 1500,
    highlights: [
      "2 fotografa",
      "Do 10 sati pokrivanja",
      "200+ obrađenih fotografija",
    ],
  },
};