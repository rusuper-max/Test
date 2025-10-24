// src/app/api/inquiry-quick/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type VerifyResp = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
};

type QuickBody = {
  type?: string;
  date?: string;
  location?: string;
  email?: string;
  message?: string;
  website?: string; // honeypot
  tsToken?: string; // Turnstile response token sa klijenta
};

/** IP bez any – čita standardne headere */
function getClientIp(req: NextRequest): string | undefined {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuickBody;

    // honeypot
    if (typeof body?.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    // **Turnstile**
    const token = String(body?.tsToken || "").trim();
    if (!token) return new NextResponse("Missing captcha", { status: 400 });

    const secret = process.env.TURNSTILE_SECRET_KEY!;
    const ip = getClientIp(req);

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
          ...(ip ? { remoteip: ip } : {}),
        }),
      }
    );

    const verifyJson = (await verifyRes.json()) as VerifyResp;
    if (!verifyJson.success) {
      const code = verifyJson["error-codes"]?.join(", ") || "unknown_error";
      return new NextResponse(`Captcha failed: ${code}`, { status: 400 });
    }

    // 2) Minimalna validacija podataka
    const type = String(body?.type || "").trim();
    const date = String(body?.date || "").trim();
    const location = String(body?.location || "").trim();
    const email = String(body?.email || "").trim();
    const message = String(body?.message || "").trim();

    if (!type || !date || !location || !email) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // 3) SMTP transporter (isti kao ranije)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || "false") === "true",
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    const to =
      process.env.MAIL_TO_QUICK ||
      process.env.MAIL_TO ||
      process.env.EMAIL_USER ||
      "studio.contrast031@gmail.com";

    const from = process.env.MAIL_FROM || process.env.EMAIL_USER;
    const subject = `📩 Brzi upit — ${type} (${date})`;

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;">
        <h2 style="margin:0 0 10px;">📸 Brzi upit sa sajta Studio Contrast</h2>

        <p><strong>Tip događaja:</strong> ${escapeHtml(type)}</p>
        <p><strong>Datum:</strong> ${escapeHtml(date)}</p>
        <p><strong>Lokacija:</strong> ${escapeHtml(location)}</p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />

        <p><strong>Email pošiljaoca:</strong> ${escapeHtml(email)}</p>
        ${
          message
            ? `<p><strong>Poruka:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`
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
      replyTo: email,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg =
      typeof err === "object" && err && "message" in err
        ? String((err as { message?: string }).message)
        : String(err);
    console.error("Quick inquiry error:", msg);
    return new NextResponse("Failed to send", { status: 500 });
  }
}

/* helpers */
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}