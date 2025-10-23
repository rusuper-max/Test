// src/app/api/inquiry/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

/* ───────────── helpers ───────────── */
function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
/** "22" | "930" | "9:5" | "12:70" -> "HH:MM" (clamp) */
function normalizeTime(raw?: string): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (/^\d{1,2}$/.test(s)) {
    const hh = clamp(Number(s), 0, 23);
    return `${String(hh).padStart(2, "0")}:00`;
  }
  if (/^\d{3,4}$/.test(s)) {
    const mm = clamp(Number(s.slice(-2)), 0, 59);
    const hh = clamp(Number(s.slice(0, -2)), 0, 23);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  const m = /^(\d{1,2}):(\d{1,2})$/.exec(s);
  if (m) {
    const hh = clamp(Number(m[1]), 0, 23);
    const mm = clamp(Number(m[2]), 0, 59);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  return "";
}

const PLAN_NAME: Record<string, string> = {
  basic: "Standard",
  classic: "Premium",
  signature: "Signature",
};

const PLAN_ACCENT: Record<string, string> = {
  basic: "#94a3b8",      // slate-400
  classic: "#eab308",    // amber-500 (zlatno)
  signature: "#14b8a6",  // teal-500
};

function prettyLabel(key: string) {
  const k = (key || "").toLowerCase();
  if (k === "secondphotog") return "Drugi fotograf";
  if (k === "thirdphotog") return "Treći fotograf";
  if (k === "secondvideographer") return "Dodatni kamerman";
  if (k === "video") return "Video";
  if (k === "video4k") return "4K video";
  if (k === "drone") return "Dron";
  if (k === "album") return "Album (premium)";
  if (k === "express") return "Ekspres obrada";
  if (k === "raw") return "RAW fajlovi";
  if (k === "printonsite") return "Izrada fotografija na licu mesta";
  if (k === "usb") return "USB";
  if (k === "dontpublish") return "Ne objavljuj u portfoliju / na mrežama";
  return key;
}

/** Preferira body.addons[], ali radi i sa starim boolean poljima. */
function extractAddons(body: any): string[] {
  const set = new Set<string>();
  if (Array.isArray(body?.addons)) for (const k of body.addons) if (k) set.add(String(k));

  const booleanKeys = [
    "secondPhotog","thirdPhotog","secondVideographer","video","video4k","drone",
    "album","express","raw","printOnSite","usb","dontPublish",
  ];
  for (const k of booleanKeys) {
    const v = body?.[k];
    const isTrue =
      v === true || v === 1 ||
      (typeof v === "string" && ["1","true","yes","da"].includes(v.toLowerCase()));
    if (isTrue) set.add(k);
  }
  return Array.from(set);
}

/* ───────────── route ───────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || "false") === "true",
      auth: { user: process.env.EMAIL_USER!, pass: process.env.EMAIL_PASS! },
    });

    const to = process.env.MAIL_TO || process.env.EMAIL_USER;
    const from = process.env.MAIL_FROM || process.env.EMAIL_USER;

    const typeDisplay = body?.type?.trim?.() ? String(body.type) : "Nije navedeno";
    const start = normalizeTime(body?.start);
    const end = normalizeTime(body?.end);

    const planSlug = String(body?.plan || "");
    const planName = PLAN_NAME[planSlug] || (planSlug ? planSlug : "—");
    const accent = PLAN_ACCENT[planSlug] || "#6b7280";

    const priceHintNum = Number(body?.priceHint || 0);
    const priceHint = Number.isFinite(priceHintNum) && priceHintNum > 0
      ? priceHintNum.toLocaleString("sr-RS")
      : null;

    const extraHoursNum = Number(body?.extraHours || 0);
    const extraHours = Number.isFinite(extraHoursNum) && extraHoursNum > 0 ? extraHoursNum : 0;

    const addons = extractAddons(body);
    const addonsHtml = addons.length
      ? addons.map((k) =>
          `<span style="display:inline-block;margin:2px 6px 2px 0;padding:.25rem .5rem;border:1px solid #e5e7eb;border-radius:999px;background:#f8fafc;color:#0f172a;font-size:12px;">${escapeHtml(prettyLabel(k))}</span>`
        ).join("")
      : "—";
    const addonsText = addons.length ? addons.map((k) => prettyLabel(k)).join(", ") : "—";

    const subject = `📩 Upit — ${typeDisplay} (${planName})`;

    // HTML
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#0f172a;">
        <div style="background:linear-gradient(180deg,#0ea5e9,#14b8a6);padding:14px 18px;border-radius:12px;color:white;font-weight:600;margin-bottom:14px;">
          📸 Novi upit sa sajta Studio Contrast
        </div>

        <p><strong>Tip događaja:</strong> ${escapeHtml(typeDisplay)}</p>
        <p><strong>Datum:</strong> ${escapeHtml(body?.date || "-")} (${start || "-"}–${end || "-"})</p>
        <p><strong>Lokacija:</strong> ${escapeHtml(body?.location || "-")}</p>
        <p><strong>Paket:</strong>
          <span style="display:inline-block;margin-left:6px;border:1px solid ${accent};color:${accent};padding:.15rem .55rem;border-radius:999px;font-weight:700;">
            ${escapeHtml(planName)}
          </span>
        </p>

        <div style="margin:16px 0;padding:12px;border:1px solid ${accent}40;border-radius:12px;background:#f9fafb;">
          <div style="font-weight:700;margin-bottom:6px;color:${accent}">Iz konfiguratora</div>
          <div><strong>Odabrani dodaci:</strong> ${addonsHtml}</div>
          ${extraHours ? `<div style="margin-top:6px;"><strong>Dodatni sati:</strong> ${extraHours}</div>` : ""}
          ${priceHint ? `<div style="margin-top:6px;"><strong>Orijentaciona cena:</strong> ~${priceHint} €</div>` : ""}
        </div>

        <div style="margin-top:10px;">
          <div style="font-weight:700;margin-bottom:4px;">Kontakt</div>
          <div><strong>Ime:</strong> ${escapeHtml(body?.name || "-")}</div>
          <div><strong>Telefon:</strong> ${escapeHtml(body?.phone || "-")}</div>
          <div><strong>Email:</strong> ${escapeHtml(body?.email || "-")}</div>
        </div>

        <div style="margin-top:10px;">
          <div style="font-weight:700;margin-bottom:4px;">Poruka</div>
          <div>${escapeHtml(body?.message || "-").replace(/\n/g, "<br/>")}</div>
        </div>
      </div>
    `;

    // TEXT
    const text = [
      `Tip događaja: ${typeDisplay}`,
      `Datum: ${body?.date || "-"} (${start || "-"}–${end || "-"})`,
      `Lokacija: ${body?.location || "-"}`,
      `Paket: ${planName}`,
      ``,
      `Odabrani dodaci: ${addonsText}`,
      extraHours ? `Dodatni sati: ${extraHours}` : ``,
      priceHint ? `Orijentaciona cena: ~${priceHint} €` : ``,
      ``,
      `Kontakt: ${body?.name || "-"} | ${body?.phone || "-"}`,
      `Email: ${body?.email || "-"}`,
      ``,
      `Poruka:`,
      `${body?.message || "-"}`,
    ].filter(Boolean).join("\n");

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      replyTo: body?.email || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Inquiry mail error:", err?.message || err);
    return new NextResponse("Failed to send", { status: 500 });
  }
}