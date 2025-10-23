import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── SMTP transporter iz .env.local ───────────────────────────────────────────
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || "false") === "true",
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    // primaoci/pošiljalac (možeš hardkodovati ovde ako želiš)
    const to = process.env.MAIL_TO || process.env.EMAIL_USER;
    const from = process.env.MAIL_FROM || process.env.EMAIL_USER;

    // ── Fallback vrednosti (da ne dobijamo “-”) ──────────────────────────────────
    const typeDisplay =
      body?.type && String(body.type).trim() !== "" ? String(body.type) : "Nije navedeno";

    // normalizuj vreme (ako front nije već odradio)
    const start = normalizeTime(body?.start);
    const end = normalizeTime(body?.end);

    // orijentaciona cena (broj → “1.234”)
    const priceNum = Number(body?.price || 0);
    const price = Number.isFinite(priceNum)
      ? priceNum.toLocaleString("sr-RS")
      : "0";

    const priceHintNum = Number(body?.priceHint || 0);
    const priceHint =
      priceHintNum > 0 ? priceHintNum.toLocaleString("sr-RS") : null;

    // ── HTML (lep format) ───────────────────────────────────────────────────────
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica, Arial, sans-serif; font-size:15px; line-height:1.55; color:#1f2937;">
        <h2 style="color:#14b8a6; margin:0 0 8px;">📸 Novi upit sa sajta Studio Contrast</h2>

        <p><strong>Tip događaja:</strong> ${escapeHtml(typeDisplay)}</p>
        <p><strong>Datum:</strong> ${escapeHtml(body?.date || "-")} (${start || "-"}–${end || "-"})</p>
        <p><strong>Lokacija:</strong> ${escapeHtml(body?.location || "-")}</p>

        <hr style="border:none;border-top:1px solid #e5e7eb; margin:16px 0;" />

        <p><strong>Paket:</strong> ${escapeHtml(body?.plan || "-")}</p>
        <p><strong>Dodaci:</strong><br/>
          • Dodatni sati: ${Number(body?.extraHours || 0)}<br/>
          • Drugi fotograf: ${body?.secondPhotog ? "DA" : "NE"}<br/>
          • Video: ${body?.video ? "DA" : "NE"}<br/>
          • Dron: ${body?.drone ? "DA" : "NE"}<br/>
          • Album: ${body?.album ? "DA" : "NE"}<br/>
          • Ekspres obrada: ${body?.express ? "DA" : "NE"}<br/>
          • Kilometraža: ${Number(body?.km || 0)} km
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb; margin:16px 0;" />

        <p>
          <strong>Kontakt:</strong> ${escapeHtml(body?.name || "-")} | ${escapeHtml(body?.phone || "-")}<br/>
          <strong>Email:</strong> ${escapeHtml(body?.email || "-")}
        </p>

        <p><strong>Poruka:</strong><br/>${escapeHtml(body?.message || "-").replace(/\n/g, "<br/>")}</p>

        <p style="margin-top:14px;">
          <strong>Orijentaciona cena:</strong> ~${price} €
          ${priceHint ? `<span style="color:#6b7280;">(polazno iz Ponuda: ~${priceHint} €)</span>` : ""}
        </p>
      </div>
    `;

    // ── TEXT (plain) ────────────────────────────────────────────────────────────
    const text = [
      `Tip događaja: ${typeDisplay}`,
      `Datum: ${body?.date || "-"} (${start || "-"}–${end || "-"})`,
      `Lokacija: ${body?.location || "-"}`,
      ``,
      `Paket: ${body?.plan || "-"}`,
      `Dodaci:`,
      `- Dodatni sati: ${Number(body?.extraHours || 0)}`,
      `- Drugi fotograf: ${body?.secondPhotog ? "DA" : "NE"}`,
      `- Video: ${body?.video ? "DA" : "NE"}`,
      `- Dron: ${body?.drone ? "DA" : "NE"}`,
      `- Album: ${body?.album ? "DA" : "NE"}`,
      `- Ekspres obrada: ${body?.express ? "DA" : "NE"}`,
      `- Kilometraža: ${Number(body?.km || 0)} km`,
      ``,
      `Kontakt: ${body?.name || "-"} | ${body?.phone || "-"}`,
      `Email: ${body?.email || "-"}`,
      ``,
      `Poruka:`,
      `${body?.message || "-"}`,
      ``,
      `Orijentaciona cena: ~${price} €${priceHint ? ` (polazno iz Ponuda: ~${priceHint} €)` : ""}`,
    ].join("\n");

    const subject = `📩 Upit — ${typeDisplay} (${body?.plan || "paket"})`;

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

/* ───────────────────────── helpers ───────────────────────── */

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Prihvata "22", "930", "9:5", "12:70" → vraća "HH:MM" (clamp) */
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