import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "node:path";
import fs from "node:fs/promises";
import type { AddonRule } from "@/lib/addons";

/* ---------- utils ---------- */
function norm(s: any): string {
  if (s == null) return "";
  return String(s)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "dj")
    .replace(/[^a-z0-9 \-_/]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function parseNumberMaybe(v: any): number | null {
  if (v == null) return null;
  let s = String(v).trim();
  if (!s) return null;
  if (/[a-zA-Z€]/.test(s)) return null;
  s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function valueToRule(vRaw: any): AddonRule | null {
  // checkbox u sheetu
  if (typeof vRaw === "boolean") return vRaw ? { state: "included" } : { state: "hidden" };

  const rawStr = String(vRaw ?? "").trim();
  if (!rawStr) return null;

  const s = norm(rawStr); // bez dijakritika, mala slova

  // Negacije
  if (s === "ne" || s === "nije" || s === "no" || s === "n" || s.includes("nije ukljuc")) {
    return { state: "hidden" };
  }

  // Simboli / YES
  if (/[✓✔✅]/.test(rawStr)) return { state: "included" };
  if (/^\s*[xX+]\s*$/.test(rawStr)) return { state: "included" };
  if (/(^|\s)(da|yes|true)(\s|$)/i.test(rawStr)) return { state: "included" };

  // "uključeno/uključen/uklj…"
  if (s.includes("ukljuc")) return { state: "included" };

  // Broj → doplata; 0 → included (gratis)
  const num = parseNumberMaybe(rawStr);
  if (num != null) return num === 0 ? { state: "included" } : { state: "available", price: num };

  return null;
}

function isBasePriceHeader(headerRaw: string): boolean {
  const h = norm(headerRaw);
  if (!h) return false;
  if (h.startsWith("cena")) return true;
  if (h.includes("price")) return true;
  return false;
}

// Mapiranje vidljivih naziva paketa
function planNameToSlug(nameRaw: string): "basic" | "classic" | "signature" | null {
  const n = norm(nameRaw);
  if (n.startsWith("standard") || n === "pocetni" || n === "basic") return "basic";
  if (n.startsWith("premium") || n === "classic") return "classic";
  if (n.startsWith("signature")) return "signature";
  return null;
}

// Tolerantno mapiranje kolona → addon key
function headerToAddonKey(headerRaw: string): string | null {
  const h = norm(headerRaw);
  if (!h) return null;

  // tačni
  if (h === "album") return "album";
  if (h === "drugi fotograf") return "secondPhotog";
  if (h === "treci fotograf") return "thirdPhotog";
  if (h === "dodatni kamerman") return "secondVideographer";
  if (h === "ne objavljuj slike na mrezama") return "dontPublish";
  if (h === "dron") return "drone";
  if (h === "video") return "video";
  if (h === "raw") return "raw";
  if (h === "expres obrada" || h === "ekspres obrada") return "express";
  if (h === "izrada foto na licu mesta") return "printOnSite";
  if (h === "4k video" || h === "video 4k") return "video4k";
  if (h === "usb") return "usb";

  // tolerantne varijacije
  if ((h.includes("drugi") || h.startsWith("drugi")) && (h.includes("foto") || h.includes("fotogr")))
    return "secondPhotog";
  if ((h.includes("treci") || h.startsWith("treci")) && (h.includes("foto") || h.includes("fotogr")))
    return "thirdPhotog";
  if (h.includes("dodatni") && (h.includes("kam") || h.includes("kamer") || h.includes("kamerman") || h.includes("videograf") || h.includes("kamera")))
    return "secondVideographer";
  if (h.includes("objavljuj")) return "dontPublish";
  if (h.includes("4k")) return "video4k";
  if (h.includes("ekspres") || h.includes("expres")) return "express";
  if (h.includes("raw")) return "raw";
  if (h.includes("dron")) return "drone";
  if (h.includes("album")) return "album";
  if (h.includes("usb")) return "usb";
  if (h.includes("izrada") && h.includes("mesta")) return "printOnSite";
  if (h.includes("video")) return "video"; // na kraju, da ne pojede 4k

  return null;
}

/** GVIZ loader (SHEETS_ID / SHEETS_TAB) — prefer f/label nad v */
async function loadFromGviz(): Promise<Array<Record<string, any>> | null> {
  const id = process.env.SHEETS_ID;
  const tab = process.env.SHEETS_TAB || "Addons";
  if (!id) return null;

  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    id
  )}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tab)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const text = await res.text();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) return null;
  const json = JSON.parse(text.slice(firstBrace, lastBrace + 1));

  if (!json?.table?.cols || !json?.table?.rows) return null;

  const cols = json.table.cols.map((c: any) => c?.label || "");
  const rows = json.table.rows as any[];

  const out: Array<Record<string, any>> = [];
  for (const r of rows) {
    const obj: Record<string, any> = {};
    (r.c || []).forEach((cell: any, i: number) => {
      const header = cols[i] || `col_${i}`;
      // KLJUČNO: formatirani tekst (npr. "70 uključeno") ume da stoji u f/label
      const formatted = (cell?.f ?? cell?.label ?? "");
      const raw = formatted !== "" ? formatted : (cell?.v ?? "");
      obj[header] = raw;
    });
    out.push(obj);
  }
  return out;
}

/** Fallback na lokalni XLSX */
async function loadFromXlsx(): Promise<Array<Record<string, any>>> {
  const p = path.join(process.cwd(), "public", "data", "addons.xlsx");
  const buf = await fs.readFile(p);
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[];
}

/** Posle parsiranja: “extras” koji liče na addon → included */
function promoteIncludedFromExtras(
  addons: Record<string, Record<"basic" | "classic" | "signature", Record<string, AddonRule>>>,
  extrasIncluded: Record<string, Record<"basic" | "classic" | "signature", string[]>>
) {
  for (const ev of Object.keys(extrasIncluded || {})) {
    for (const p of ["basic", "classic", "signature"] as const) {
      const arr = extrasIncluded[ev]?.[p] || [];
      if (!arr.length) continue;

      const keep: string[] = [];
      for (const label of arr) {
        const key = headerToAddonKey(label);
        if (key) {
          addons[ev] ||= { basic: {}, classic: {}, signature: {} };
          addons[ev][p] ||= {};
          if (!addons[ev][p][key]) {
            addons[ev][p][key] = { state: "included" };
            continue; // izbačeno iz extras
          }
        }
        keep.push(label);
      }
      extrasIncluded[ev][p] = keep;
    }
  }
}

/* ---------- Main GET ---------- */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const debug = url.searchParams.get("debug") === "1";

  try {
    const rows = (await loadFromGviz()) ?? (await loadFromXlsx());

    const headers = rows.length ? Object.keys(rows[0]) : [];
    const baseHeader =
      headers.find(isBasePriceHeader) ||
      headers.find((h) => norm(h) === "cena") ||
      headers[2] ||
      "Cena";

    const base: Record<string, Record<"basic" | "classic" | "signature", number>> = {};
    const addons: Record<string, Record<"basic" | "classic" | "signature", Record<string, AddonRule>>> = {};
    const extrasIncluded: Record<string, Record<"basic" | "classic" | "signature", string[]>> = {};
    const notes: Record<string, Record<"basic" | "classic" | "signature", string>> = {};
    const eventTypesSet = new Set<string>();
    const rowSnapshots: Array<{event:string; plan:string; cells:Record<string,string>}> = [];

    for (const row of rows) {
      const planName = row["Paket"] ?? row["Plan"] ?? row["Package"];
      const eventName = row["Vid Proslave"] ?? row["Event"] ?? row["Tip"];
      if (!planName || !eventName) continue;

      const plan = planNameToSlug(String(planName));
      if (!plan) continue;

      const event = String(eventName).trim();
      eventTypesSet.add(event);

      base[event] ||= { basic: 0, classic: 0, signature: 0 };
      addons[event] ||= { basic: {}, classic: {}, signature: {} };
      extrasIncluded[event] ||= { basic: [], classic: [], signature: [] };
      notes[event] ||= { basic: "", classic: "", signature: "" };

      // base price
      const baseCell = row[baseHeader];
      const baseNum = parseNumberMaybe(baseCell);
      if (baseNum != null) base[event][plan] = baseNum;

      // notes
      const noteCell = row["Napomena"] ?? row["Note"] ?? row["Napomene"];
      if (noteCell) notes[event][plan] = String(noteCell).trim();

      // kolone → addoni / extras
      for (const header of headers) {
        if (header === "Paket" || header === "Plan" || header === "Package") continue;
        if (header === "Vid Proslave" || header === "Event" || header === "Tip") continue;
        if (header === baseHeader) continue;
        if (header === "Napomena" || header === "Note" || header === "Napomene") continue;

        const cell = row[header];
        if (cell === "" || cell == null) continue;

        const key = headerToAddonKey(header);
        if (key) {
          const rule = valueToRule(cell);
          if (rule) {
            if (key === "dontPublish") {
              addons[event][plan][key] = { state: "available", price: 0 };
            } else {
              addons[event][plan][key] = rule;
            }
          }
        } else {
          // nije addon kolona, a piše "uključeno" → extra feature u opisu
          const s = norm(cell);
          if (s.includes("ukljuc")) {
            extrasIncluded[event][plan].push(String(header).trim());
          }
        }
      }

      // osiguraj privacy toggle gratis
      if (!addons[event][plan]["dontPublish"]) {
        addons[event][plan]["dontPublish"] = { state: "available", price: 0 };
      }

      // Debug snapshot reda
      if (debug) {
        const snap: Record<string, string> = {};
        for (const h of headers) snap[h] = String(row[h] ?? "");
        rowSnapshots.push({ event, plan, cells: snap });
      }
    }

    // generička promocija extras → included addoni
    promoteIncludedFromExtras(addons, extrasIncluded);

    const eventTypes = Array.from(eventTypesSet);

    return NextResponse.json({
      ok: true,
      eventTypes,
      base,
      addons,
      extrasIncluded,
      notes,
      ...(debug
        ? {
            _debug: {
              source: process.env.SHEETS_ID ? "gviz" : "local-xlsx",
              baseHeader,
              headers,
              rowsCount: rows.length,
              rowSnapshots,
            },
          }
        : {}),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "addons failed" }, { status: 500 });
  }
}