import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // honeypot: ako je polje "website" popunjeno, tretiraj kao spam i reci "ok"
    if (typeof body?.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    // minimalna validacija
    const type = String(body?.type || "").trim();
    const date = String(body?.date || "").trim();
    const location = String(body?.location || "").trim();
    const email = String(body?.email || "").trim();
    const message = String(body?.message || "").trim();

    if (!type || !date || !location || !email) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // SMTP transporter (isti kao kod glavne rute)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || "false") === "true",
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    // primaoci/pošiljalac
    const to =
      process.env.MAIL_TO_QUICK ||
      process.env.MAIL_TO ||
      process.env.EMAIL_USER ||
      "studio.contrast031@gmail.com"; // fallback za test

    const from = process.env.MAIL_FROM || process.env.EMAIL_USER;

    const subject = `📩 Brzi upit — ${type} (${date})`;

    // jednostavan, svetli HTML
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;">
        <h2 style="margin:0 0 10px;">📸 Brzi upit sa sajta Studio Contrast</h2>

        <p><strong>Tip događaja:</strong> ${escape(type)}</p>
        <p><strong>Datum:</strong> ${escape(date)}</p>
        <p><strong>Lokacija:</strong> ${escape(location)}</p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />

        <p><strong>Email pošiljaoca:</strong> ${escape(email)}</p>
        ${
          message
            ? `<p><strong>Poruka:</strong><br/>${escape(message).replace(/\n/g, "<br/>")}</p>`
            : `<p><em>(bez poruke)</em></p>`
        }
      </div>
    `;

    const text = [
      `Brzi upit sa sajta Studio Contrast`,
      `Tip događaja: ${type}`,
      `Datum: ${date}`,
      `Lokacija: ${location}`,
      ``,
      `Email pošiljaoca: ${email}`,
      `Poruka:`,
      message || "(bez poruke)",
    ].join("\n");

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      replyTo: email, // da možeš direktno da "Reply" klijentu
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Quick inquiry error:", err?.message || err);
    return new NextResponse("Failed to send", { status: 500 });
  }
}

/* helpers */
function escape(s: string) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}