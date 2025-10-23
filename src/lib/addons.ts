// src/lib/addons.ts

export type EventType = "Svadba" | "Venčanje" | "Studio" | "Rođendan" | "Krštenja";

export const EVENT_TYPES: EventType[] = ["Svadba", "Venčanje", "Studio", "Rođendan", "Krštenja"];

export type AddonKey =
  | "album"
  | "secondPhotog"
  | "thirdPhotog"
  | "secondVideographer"
  | "dontPublish"
  | "drone"
  | "video"
  | "video4k"
  | "raw"
  | "express"
  | "printOnSite"
  | "usb";

export type AddonRule =
  | { state: "included" }
  | { state: "available"; price?: number }
  | { state: "hidden" };

export type AddonsApiResponse = {
  ok: true;
  eventTypes: EventType[];
  base: Record<string, Record<"basic" | "classic" | "signature", number>>;
  addons: Record<string, Record<"basic" | "classic" | "signature", Record<AddonKey, AddonRule>>>;
  extrasIncluded: Record<string, Record<"basic" | "classic" | "signature", string[]>>;
  notes: Record<string, Record<"basic" | "classic" | "signature", string>>;
};