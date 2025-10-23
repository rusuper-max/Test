export const runtime = "nodejs";

import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";

export async function GET() {
  const filePath =
    process.env.ADDONS_XLS_PATH ||
    path.join(process.cwd(), "public", "data", "addons.xlsx");

  const exists = fs.existsSync(filePath);
  return NextResponse.json({
    ok: true,
    path: filePath,
    exists,
  });
}