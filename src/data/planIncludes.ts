// src/data/planIncludes.ts
import type { PlanSlug } from "@/data/packages";
import type { EventType } from "@/lib/addons";

type IncludesMap = Record<EventType, Record<PlanSlug, string[]>>;

const BASE: IncludesMap = {
  Svadba: {
    basic: [
      "Profesionalno fotografisanje",
      "Selekcija i osnovna obrada",
      "Privatna online galerija za preuzimanje",
    ],
    classic: [
      "Produženo pokrivanje događaja",
      "Naprednija obrada",
      "Privatna online galerija za preuzimanje",
    ],
    signature: [
      "Celodnevno pokrivanje",
      "Detaljna postprodukcija",
      "Privatna online galerija i arhiva",
    ],
  },
  Venčanje: {
    basic: [
      "Profesionalno fotografisanje",
      "Selekcija i osnovna obrada",
      "Privatna online galerija za preuzimanje",
    ],
    classic: [
      "Produženo pokrivanje događaja",
      "Naprednija obrada",
      "Privatna online galerija za preuzimanje",
    ],
    signature: [
      "Celodnevno pokrivanje",
      "Detaljna postprodukcija",
      "Privatna online galerija i arhiva",
    ],
  },
  Studio: {
    basic: [
      "Studijsko fotografisanje",
      "Selekcija i osnovna obrada",
      "Privatna online galerija za preuzimanje",
    ],
    classic: [
      "Prošireno studijsko vreme",
      "Naprednija obrada",
      "Privatna online galerija za preuzimanje",
    ],
    signature: [
      "Produženo studijsko snimanje",
      "Detaljna postprodukcija",
      "Privatna online galerija i arhiva",
    ],
  },
  Rođendan: {
    basic: [
      "Profesionalno pokrivanje događaja",
      "Selekcija i osnovna obrada",
      "Privatna online galerija za preuzimanje",
    ],
    classic: [
      "Produženo pokrivanje događaja",
      "Naprednija obrada",
      "Privatna online galerija za preuzimanje",
    ],
    signature: [
      "Celodnevno pokrivanje (po potrebi)",
      "Detaljna postprodukcija",
      "Privatna online galerija i arhiva",
    ],
  },
  Krštenja: {
    basic: [
      "Profesionalno fotografisanje",
      "Selekcija i osnovna obrada",
      "Privatna online galerija za preuzimanje",
    ],
    classic: [
      "Prošireno pokrivanje obreda / događaja",
      "Naprednija obrada",
      "Privatna online galerija za preuzimanje",
    ],
    signature: [
      "Celodnevno pokrivanje (po potrebi)",
      "Detaljna postprodukcija",
      "Privatna online galerija i arhiva",
    ],
  },
};

export function getPlanIncludes(eventType: EventType, plan: PlanSlug): string[] {
  return BASE[eventType]?.[plan] ?? [];
}