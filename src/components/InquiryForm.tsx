// src/components/InquiryForm.tsx
"use client";

import { useMemo, useState } from "react";
import { deco } from "@/lib/fonts";
import { PLANS, type PlanSlug } from "@/data/packages";

// Dozvoljeni tipovi događaja (prvi je default)
const TYPES = ["Svadba", "Venčanje", "Portret", "Rođendan", "Krštenja", "Drugo"] as const;
type TypeOption = (typeof TYPES)[number];

type FormState = {
  type: TypeOption;
  date: string;
  start?: string;
  end?: string;
  location: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

// koristi se SAMO za mailto fallback kad API ne uspe
const TO_EMAIL = "Rusuper@gmail.com";

/* ---------- helpers za vreme ---------- */
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
function normalizeTime(raw: string | undefined): string {
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
function isValidTime(t?: string) {
  return !!t && /^\d{2}:\d{2}$/.test(t);
}
/* ------------------------------------- */

/** Garantuje da je vrednost validna iz TYPES; inače vraća “Svadba” */
function normalizeType(v?: string): TypeOption {
  const s = (v ?? "").trim();
  return (TYPES as readonly string[]).includes(s) ? (s as TypeOption) : "Svadba";
}

// lepo ime addona za email rezime
function prettyLabel(key: string) {
  const k = key.toLowerCase();
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

export default function InquiryForm({
  prefill,
}: {
  // prefill dolazi iz /upit/page.tsx (plan + izabrani addoni + priceHint + extraHours)
  prefill?: Partial<FormState> & {
    priceHint?: number;
    plan?: PlanSlug;
    extraHours?: number;

    // addoni (samo za rezime u mejlu)
    secondPhotog?: boolean;
    thirdPhotog?: boolean;
    secondVideographer?: boolean;
    video?: boolean;
    video4k?: boolean;
    drone?: boolean;
    album?: boolean;
    express?: boolean;
    raw?: boolean;
    printOnSite?: boolean;
    usb?: boolean;
    dontPublish?: boolean;
  };
}) {
  // inicijalni state: merge + NORMALIZACIJA type
  const DEFAULT: FormState = {
    type: "Svadba",
    date: "",
    start: "",
    end: "",
    location: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  };
  const initial: FormState = {
    ...DEFAULT,
    ...(prefill || {}),
    type: normalizeType(prefill?.type ?? DEFAULT.type),
  };
  const [f, setF] = useState<FormState>(initial);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "err">(null);
  const priceHint = prefill?.priceHint;

  // VALIDACIJA (opušteno za telefon: ≥7 cifara)
  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(f.email.trim()), [f.email]);
  const phoneDigits = useMemo(() => f.phone.replace(/\D+/g, ""), [f.phone]);
  const phoneValid = phoneDigits.length >= 7;
  const canSubmit =
    f.name.trim().length >= 2 &&
    emailValid &&
    phoneValid &&
    f.date.trim().length >= 4 &&
    f.location.trim().length >= 2;

  // generičan onChange
  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const el = e.target as HTMLInputElement;
      const val: any = el.value;
      setF((s) => ({ ...s, [key]: val }));
    };

  // na blur za vreme — normalizuj (radi i za “22” → “22:00”)
  const onTimeBlur = (key: "start" | "end") => (e: React.FocusEvent<HTMLInputElement>) => {
    setF((s) => ({ ...s, [key]: normalizeTime(e.target.value) }));
  };

  // addoni odabrani u konfiguratoru (samo za email + payload)
  const selectedAddons = useMemo(() => {
    const map = {
      secondPhotog: !!prefill?.secondPhotog,
      thirdPhotog: !!prefill?.thirdPhotog,
      secondVideographer: !!prefill?.secondVideographer,
      video: !!prefill?.video,
      video4k: !!prefill?.video4k,
      drone: !!prefill?.drone,
      album: !!prefill?.album,
      express: !!prefill?.express,
      raw: !!prefill?.raw,
      printOnSite: !!prefill?.printOnSite,
      usb: !!prefill?.usb,
      dontPublish: !!prefill?.dontPublish,
    };
    return Object.entries(map)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }, [prefill]);

  // SUBJECT + BODY (za mailto fallback)
  const subject = useMemo(() => {
    const planName = prefill?.plan ? PLANS[prefill.plan].name : "Paket (nije odabran)";
    return `Upit — ${planName} / ${f.type} (${f.date || "datum TBA"})`;
  }, [prefill?.plan, f.type, f.date]);

  const body = useMemo(() => {
    const startT = isValidTime(f.start) ? f.start : "";
    const endT = isValidTime(f.end) ? f.end : "";
    const timePart = startT || endT ? ` (${startT || "?"}–${endT || "?"})` : "";

    const planLine = prefill?.plan ? `${PLANS[prefill.plan].name}` : "— (nije odabran)";

    const lines = [
      "Zdravo Studio Contrast,",
      "",
      "Želeo/la bih da proverim dostupnost i okvirnu ponudu.",
      "",
      `Tip događaja: ${f.type}`,
      `Datum: ${f.date}${timePart}`,
      `Lokacija: ${f.location}`,
      "",
      `Paket: ${planLine}`,
      selectedAddons.length
        ? `Dodaci: ${selectedAddons.map(prettyLabel).join(", ")}`
        : "Dodaci: —",
      prefill?.extraHours ? `Dodatni sati: ${prefill.extraHours}` : "",
      "",
      `Kontakt: ${f.name} | ${f.phone}`,
      `Email: ${f.email}`,
      "",
      "Poruka:",
      f.message || "-",
      "",
      priceHint ? `Orijentaciona cena iz konfiguratora: ~${priceHint.toLocaleString("sr-RS")} €` : "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [f, selectedAddons, prefill?.plan, prefill?.extraHours, priceHint]);

  const mailtoHref = useMemo(() => {
    const s = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    return `mailto:${TO_EMAIL}?subject=${s}&body=${b}`;
  }, [subject, body]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || sending) return;

    // payload: forma + sve iz konfiguratora (proslleđeno kroz prefill)
    const payload = {
      ...f,
      start: normalizeTime(f.start),
      end: normalizeTime(f.end),
      // iz konfiguratora:
      plan: prefill?.plan,
      extraHours: prefill?.extraHours ?? 0,
      priceHint: priceHint,
      addons: selectedAddons,
    };

    setSending(true);
    setSent(null);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setSent("ok");
    } catch {
      // fallback na mailto ako API padne
      window.location.href = mailtoHref;
      setSent("err");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      {/* Jedna karta – samo forma. NEMA levog “konfiguratora”. */}
      <div className="card p-4 md:p-6">
        <div className={`${deco.className} label-accent`}>Detalji događaja</div>

        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm text-white/70">Tip događaja</label>
            <select
              value={f.type}
              onChange={onChange("type")}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-white/70">Datum *</label>
            <input
              type="date"
              value={f.date}
              onChange={onChange("date")}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-white/70">Vreme od</label>
            <input
              type="text"
              inputMode="numeric"
              value={f.start || ""}
              onChange={onChange("start")}
              onBlur={onTimeBlur("start")}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
              placeholder="HH:MM (npr. 22 ili 2230)"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-white/70">Vreme do</label>
            <input
              type="text"
              inputMode="numeric"
              value={f.end || ""}
              onChange={onChange("end")}
              onBlur={onTimeBlur("end")}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
              placeholder="HH:MM (npr. 01 ili 1305)"
            />
          </div>

          <div className="grid gap-1 md:col-span-2">
            <label className="text-sm text-white/70">Lokacija *</label>
            <input
              value={f.location}
              onChange={onChange("location")}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
              placeholder="Grad / venue"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-white/70">Ime i prezime *</label>
            <input
              value={f.name}
              onChange={onChange("name")}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
              placeholder="npr. Ana Jovanović"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-white/70">Email *</label>
            <input
              type="email"
              value={f.email}
              onChange={onChange("email")}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
              placeholder="npr. ana@email.com"
              required
              aria-invalid={!emailValid}
            />
            {!emailValid && <span className="text-xs text-red-400/90">Unesite validan email.</span>}
          </div>

          <div className="grid gap-1 md:col-span-2">
            <label className="text-sm text-white/70">Telefon *</label>
            <input
              value={f.phone}
              onChange={onChange("phone")}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
              placeholder="+381 6x xxx xxxx"
              required
              aria-invalid={!phoneValid}
            />
            {!phoneValid && (
              <span className="text-xs text-red-400/90">
                Unesite validan broj (min. 7 cifara, format po volji).
              </span>
            )}
          </div>

          <div className="grid gap-1 md:col-span-2">
            <label className="text-sm text-white/70">Poruka</label>
            <textarea
              rows={5}
              value={f.message}
              onChange={onChange("message")}
              placeholder="Dodatne informacije, satnica, posebne želje…"
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div className="text-xs text-white/60">
            Klikom na „Pošalji upit“ šaljemo podatke direktno na email studija.
            {sent === "err" && <> Ako imate problem, koristi se backup preko vašeg email klijenta.</>}
          </div>
          <button
            type="submit"
            disabled={!canSubmit || sending}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-70"
            title={canSubmit ? "Pošalji upit" : "Popunite obavezna polja"}
          >
            {sending ? "Slanje…" : sent === "ok" ? "Poslato ✓" : "Pošalji upit"}
          </button>
        </div>
      </div>
    </form>
  );
}