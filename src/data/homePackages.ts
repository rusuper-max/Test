// src/data/homePackages.ts
// Mapira postojeće slug-ove na marketing nazive + opis i bullet-e za HOME sekciju.
// Ovo ne utiče na konfigurator — služi samo za prikaz na početnoj strani.

import type { PlanSlug } from "@/data/packages";

type HomePkg = {
  slug: PlanSlug;           // "basic" | "classic" | "signature"
  name: string;             // "Standard" | "Premium" | "Signature"
  fromPrice: number;        // marketing "od" cena za prikaz (ne vezuje obračun)
  blurb: string;            // kratak opis ispod naslova
  bullets: string[];        // lista glavnih stavki
};

export const HOME_PACKAGES: Record<PlanSlug, HomePkg> = {
  basic: {
    slug: "basic",
    name: "Standard",
    fromPrice: 150,
    blurb:
      "Savršen izbor za manja slavlja, rođendane ili intimna venčanja.",
    bullets: [
      "1 fotograf",
      "Pokriće događaja do 8 sati",
      "200+ fotografija",
      "Sve uspešne fotografije u digitalnom formatu (bez watermarka)",
      "Online galerija za preuzimanje i deljenje",
      "Idealno za manje događaje uz sažet, emotivan prikaz dana",
    ],
  },
  classic: {
    slug: "classic",
    name: "Premium",
    fromPrice: 200,
    blurb:
      "Najpopularniji izbor — balans između trajanja, kvaliteta i količine materijala.",
    bullets: [
      "1 fotograf + asistent",
      "Celodnevno pokriće događaja",
      "300+ fotografija",
      "Sve fotografije u visokoj rezoluciji",
      "Online galerija + USB drive u personalizovanom pakovanju",
    ],
  },
  signature: {
    slug: "signature",
    name: "Signature",
    fromPrice: 300,
    blurb:
      "Ekskluzivno iskustvo — besprekorno dokumentovano i umetnički ispričano.",
    bullets: [
      "Minimum 1 fotograf + 1 kamerman",
      "Celodnevno praćenje događaja",
      "400+ profesionalno obrađenih fotografija",
      "Kratki video highlight (2–3 min) u cinematic stilu",
      "Online galerija i sigurnosna arhiva 6 meseci",
    ],
  },
};