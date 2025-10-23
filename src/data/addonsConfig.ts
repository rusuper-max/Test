// src/data/addonsConfig.ts
import type { PlanSlug } from "@/data/packages";
import type { EventType } from "@/data/eventPricing"; // ili iz tvog fajla; fallback: "Svadba" | "Venčanje" | "Portret" | "Rođendan" | "Krštenja" | "Drugo"

export type AddonKey = "secondPhotog" | "video" | "drone" | "album" | "express";
export type AddonState = "included" | "available" | "hidden";

export const ADDON_LABEL: Record<AddonKey, string> = {
  secondPhotog: "Drugi fotograf",
  video: "Video",
  drone: "Dron",
  album: "Album (premium)",
  express: "Ekspres obrada",
};

export const ADDON_PRICE: Record<AddonKey, number> = {
  secondPhotog: 200,
  video: 400,
  drone: 150,
  album: 180,
  express: 120,
};

// Default: sve je dostupno za doplatu
const DEFAULT_STATE: Record<AddonKey, AddonState> = {
  secondPhotog: "available",
  video: "available",
  drone: "available",
  album: "available",
  express: "available",
};

/**
 * Pravila iz tvoje fotografije:
 * - Rođendan: Standard -> 2 fotografa => secondPhotog=included; Signature -> video=included
 * - Svadba/Venčanje: Početni -> secondPhotog=included; Standard -> video=included; Signature -> secondPhotog+video=included
 * - Portret (Studio): video/drone hidden
 */
const RULES: Partial<Record<EventType, Partial<Record<PlanSlug, Partial<Record<AddonKey, AddonState>>>>>> = {
  "Rođendan": {
    classic: { secondPhotog: "included" },
    signature: { video: "included" },
  },
  "Svadba": {
    basic: { secondPhotog: "included" },
    classic: { video: "included" },
    signature: { secondPhotog: "included", video: "included" },
  },
  "Venčanje": {
    basic: { secondPhotog: "included" },
    classic: { video: "included" },
    signature: { secondPhotog: "included", video: "included" },
  },
  "Portret": {
    basic: { video: "hidden", drone: "hidden" },
    classic: { video: "hidden", drone: "hidden" },
    signature: { video: "hidden", drone: "hidden" },
  },
  // "Krštenja" i "Drugo" ostaju default (sve dostupno)
};

/** Vrati finalno stanje add-ona za dati event + paket. */
export function getAddonState(eventType: EventType, plan: PlanSlug, key: AddonKey): AddonState {
  const overrides = RULES[eventType]?.[plan]?.[key];
  return overrides ?? DEFAULT_STATE[key];
}

/** Pomoćno: lista add-ona označenih kao 'included' za dati event+plan. */
export function getIncludedAddons(eventType: EventType, plan: PlanSlug): AddonKey[] {
  const keys: AddonKey[] = ["secondPhotog", "video", "drone", "album", "express"];
  return keys.filter((k) => getAddonState(eventType, plan, k) === "included");
}