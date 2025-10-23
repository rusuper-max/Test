export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";

function norm(s: any) {
  return String(s ?? "").trim().toLowerCase()
    .replace(/č|ć/g, "c").replace(/š/g, "s")
    .replace(/ž/g, "z").replace(/đ/g, "dj");
}

export async function GET() {
  try {
    const filePath =
      process.env.ADDONS_XLS_PATH ||
      path.join(process.cwd(), "public", "data", "addons.xlsx");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ ok: false, error: "addons.xlsx not found", path: filePath }, { status: 404 });
    }

    const XLSX: any = await import("xlsx");
    const wb = XLSX.read(fs.readFileSync(filePath), { type: "buffer" });

    const sheetNames = wb.SheetNames;
    const ws = wb.Sheets[sheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Array<Record<string, any>>;

    // Skupi meta info: originalni naslovi kolona, normalizovani naslovi,
    // detektovana "Cena..." kolona, vrednosti u "Paket" i "Vid Proslave"
    const headersSet = new Set<string>();
    rows.forEach(r => Object.keys(r).forEach(k => headersSet.add(k)));

    const headers = Array.from(headersSet);
    const headersNorm = headers.map(h => ({ original: h, normalized: norm(h) }));

    function findPriceKey(row: Record<string, any>) {
      return Object.keys(row).find(k => norm(k).startsWith("cena")) || null;
    }

    const sample = rows.slice(0, 5).map((r) => ({
      Paket: r["Paket"],
      "Vid Proslave": r["Vid Proslave"],
      PriceKey: findPriceKey(r),
      PriceValue: (() => {
        const pk = findPriceKey(r);
        return pk ? r[pk] : null;
      })(),
      // prikaži sve kolone i vrednosti (skraćeno)
      All: r,
    }));

    const distinctPlans = Array.from(new Set(rows.map(r => norm(r["Paket"])))).slice(0, 10);
    const distinctEvents = Array.from(new Set(rows.map(r => norm(r["Vid Proslave"])))).slice(0, 10);

    return NextResponse.json({
      ok: true,
      sheetNames,
      headers: headersNorm,
      sample,
      distinctPlans,
      distinctEvents,
      totalRows: rows.length,
      path: filePath,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}