import fs from "node:fs";
import path from "node:path";

const exts = new Set([".webp", ".jpg", ".jpeg", ".png"]);

// Vrati listu {src, alt} iz public/portfolio/<category> sortirano po imenu
export function listPublicImagesIn(category: string) {
  const dir = path.join(process.cwd(), "public", "portfolio", category);
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return [];
  }

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

  return files
    .filter((f) => exts.has(path.extname(f).toLowerCase()))
    .sort(collator.compare)
    .map((f) => ({
      src: `/portfolio/${category}/${f}`,
      alt: filenameToAlt(f),
    }));
}

function filenameToAlt(filename: string) {
  // "p01-mlada_ulaz.webp" -> "p01 mlada ulaz"
  const base = filename.replace(/\.[^/.]+$/, "");
  return base.replace(/[_-]+/g, " ").trim();
}