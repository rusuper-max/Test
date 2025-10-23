// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const PORTFOLIO_ROOT = process.env.CLOUDINARY_PORTFOLIO_ROOT || "portfolio";
const HERO_FOLDER = process.env.CLOUDINARY_HERO_FOLDER || "hero";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export type CloudAsset = {
  src: string;
  width: number;
  height: number;
  format: string;
  public_id: string;
  bytes: number;
  created_at: string;
};

export async function listPortfolio(category: string): Promise<CloudAsset[]> {
  const expr = `folder=${PORTFOLIO_ROOT}/${category} AND resource_type:image`;
  const res = await cloudinary.search
    .expression(expr)
    .sort_by("filename", "asc")
    .max_results(200)
    .execute();

  return (res.resources as any[]).map((r) => ({
    src: r.secure_url as string,
    width: r.width as number,
    height: r.height as number,
    format: r.format as string,
    public_id: r.public_id as string,
    bytes: r.bytes as number,
    created_at: r.created_at as string,
  }));
}

export async function getLatestHero(): Promise<CloudAsset | null> {
  const expr = `folder=${HERO_FOLDER} AND (resource_type:video OR resource_type:image)`;
  const res = await cloudinary.search
    .expression(expr)
    .sort_by("created_at", "desc")
    .max_results(1)
    .execute();

  const r = (res.resources as any[])[0];
  if (!r) return null;

  return {
    src: r.secure_url as string,
    width: r.width as number,
    height: r.height as number,
    format: r.format as string,
    public_id: r.public_id as string,
    bytes: r.bytes as number,
    created_at: r.created_at as string,
  };
}