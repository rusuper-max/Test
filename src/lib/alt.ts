// src/lib/alt.ts

/**
 * Generiše smislen ALT za slike u galerijama / marquee-u.
 * Primer: "Venčanje — fotografija 3" ili "Portret — fotografija 1"
 */
export function altForImage(src: string, context?: string, idx?: number) {
  const label = (context || "").trim();
  const n = typeof idx === "number" ? ` ${idx + 1}` : "";
  if (label) return `${label} — fotografija${n || ""}`.trim();
  // fallback iz imena fajla
  const file = src.split("/").pop() || "fotografija";
  const base = file.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
  return `${base || "fotografija"}${n}`;
}