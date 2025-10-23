/* src/lib/pricing.ts
   Robust CSV/TSV Google Sheet reader with flexible headers and locale-safe number parsing.
   - Keeps the same public API: fetchPricing(): Promise&lt;{ rows, eventTypes }&gt;
   - Accepts both comma-, semicolon- and tab-delimited exports.
   - Handles quoted fields, BOM, stray spaces, and currency symbols (€, RSD).
*/

export type PlanSlug = "basic" | "classic" | "signature";

export type PricingRow = {
  eventType: string; // e.g. "Svadba"
  basic?: number;
  classic?: number;
  signature?: number;
};

export type PricingData = {
  rows: PricingRow[];
  eventTypes: string[];
};

/** Normalize header id: lowercase, strip spaces/underscores/dashes. */
function normHeader(h: string) {
  return h.toLowerCase().replace(/[\s_\-]+/g, "");
}

/** Try to resolve index of a header using a set of aliases. */
function headerIndex(headers: string[], aliases: string[]): number {
  for (const a of aliases) {
    const i = headers.indexOf(a);
    if (i !== -1) return i;
  }
  return -1;
}

/** Choose delimiter by inspecting the first non-empty line (comma/semicolon/tab). */
function detectDelimiter(line: string): "," | ";" | "\t" {
  const counts = {
    ",": (line.match(/,/g) || []).length,
    ";": (line.match(/;/g) || []).length,
    "\t": (line.match(/\t/g) || []).length,
  };
  // pick the delimiter with the highest count; default to comma
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as "," | ";" | "\t";
  return best || ",";
}

/** Split one CSV/TSV line respecting quotes and the chosen delimiter. */
function splitLine(line: string, delimiter: "," | ";" | "\t"): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // escaped quote ("")
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === delimiter) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** Parse CSV/TSV text into rows of cells. Removes BOM and empty trailing lines. */
function parseDelimited(text: string): { header: string[]; rows: string[][]; delimiter: "," | ";" | "\t" } {
  let t = text.replace(/^\uFEFF/, ""); // strip BOM if present
  // Normalize newlines
  t = t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = t.split("\n");
  const nonEmpty = rawLines.find((l) => l.trim().length > 0) ?? "";
  const delimiter = detectDelimiter(nonEmpty);

  const lines = rawLines.filter((l) => l.trim().length > 0);
  if (!lines.length) {
    return { header: [], rows: [], delimiter };
  }

  const headerRaw = splitLine(lines[0], delimiter);
  const header = headerRaw.map(normHeader);

  const rows = lines.slice(1).map((ln) => splitLine(ln, delimiter));
  return { header, rows, delimiter };
}

/** Locale-safe number parser:
    - Removes currency symbols (€, rsd, RSD, din, RSD.)
    - Handles thousands separators (space or dot) and decimal separators (comma or dot).
    - Examples:
      "1.200,50" → 1200.5
      "1,200.50" → 1200.5
      " 990 € "  → 990
*/
function parseNumber(x: string): number | undefined {
  if (!x) return undefined;
  let s = x.trim();

  // remove currency labels/symbols
  s = s.replace(/(?:€|eur|rsd|din|дин|rsd\.?)\b/gi, "");
  // remove all spaces
  s = s.replace(/\s+/g, "");

  // If both comma and dot exist, decide decimal as the last occurrence of [, or .]
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  let decimalSep: "," | "." | null = null;

  if (lastComma !== -1 || lastDot !== -1) {
    decimalSep = lastComma > lastDot ? "," : ".";
  }

  // Remove all thousands separators (the other symbol) and normalize decimal to dot
  if (decimalSep === ",") {
    s = s.replace(/\./g, ""); // strip dots as thousands
    s = s.replace(",", ".");  // use dot as decimal
  } else if (decimalSep === ".") {
    s = s.replace(/,/g, ""); // strip commas as thousands
  } else {
    // only digits (maybe), leave as is
  }

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

export async function fetchPricing(): Promise<PricingData> {
  const url = process.env.PRICING_SHEET_URL;
  if (!url) throw new Error("PRICING_SHEET_URL is not set");

  const res = await fetch(url, { cache: "no-store", headers: { Accept: "text/csv,*/*;q=0.9" } });
  if (!res.ok) {
    throw new Error(`Pricing fetch failed: ${res.status} ${res.statusText}`);
  }

  const csv = await res.text();
  const parsed = parseDelimited(csv);
  if (!parsed.header.length) {
    return { rows: [], eventTypes: [] };
  }

  // Resolve indices with flexible aliases
  const h = parsed.header;
  const idxEvent = headerIndex(h, ["eventtype", "event", "eventname", "type", "tip", "tipproslave"]);
  const idxBasic = headerIndex(h, ["basic", "osnovni", "paketbasic"]);
  const idxClassic = headerIndex(h, ["classic", "klasik", "paketclassic"]);
  const idxSignature = headerIndex(h, ["signature", "potpis", "paketsignature"]);

  if (idxEvent === -1) {
    // Hard requirement: without eventType we cannot build rows
    return { rows: [], eventTypes: [] };
  }

  const rows: PricingRow[] = [];
  for (const cols of parsed.rows) {
    const eventTypeRaw = cols[idxEvent] ?? "";
    const eventType = String(eventTypeRaw).trim();
    if (!eventType) continue;

    const row: PricingRow = {
      eventType,
      basic: idxBasic !== -1 ? parseNumber(cols[idxBasic] ?? "") : undefined,
      classic: idxClassic !== -1 ? parseNumber(cols[idxClassic] ?? "") : undefined,
      signature: idxSignature !== -1 ? parseNumber(cols[idxSignature] ?? "") : undefined,
    };
    rows.push(row);
  }

  // unique event types preserving order
  const seen = new Set<string>();
  const eventTypes: string[] = [];
  for (const r of rows) {
    if (!seen.has(r.eventType)) {
      seen.add(r.eventType);
      eventTypes.push(r.eventType);
    }
  }

  return { rows, eventTypes };
}