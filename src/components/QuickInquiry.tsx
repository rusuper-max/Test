"use client";

import { useMemo, useState } from "react";

type FormState = {
  type: string;
  date: string;
  location: string;
  email: string;
  message: string;
  // honeypot (anti-spam)
  website?: string;
};

const DEFAULT: FormState = {
  type: "Svadba",
  date: "",
  location: "",
  email: "",
  message: "",
};

export default function QuickInquiry({ prefill }: { prefill?: Partial<FormState> }) {
  const [f, setF] = useState<FormState>({ ...DEFAULT, ...prefill });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "err">(null);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(f.email.trim()), [f.email]);
  const canSubmit =
    f.type.trim().length >= 2 &&
    f.date.trim().length >= 4 &&
    f.location.trim().length >= 2 &&
    emailValid;

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setF((s) => ({ ...s, [key]: e.target.value }));
    };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || sending) return;

    setSending(true);
    setSent(null);
    try {
      const res = await fetch("/api/inquiry-quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) throw new Error(await res.text());
      setSent("ok");
      // lagani reset poruke (zadržavamo osnovne podatke)
      setF((s) => ({ ...s, message: "" }));
    } catch {
      setSent("err");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      {/* HONEYPOT (ne diraj) */}
      <input
        type="text"
        value={f.website || ""}
        onChange={onChange("website")}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-sm text-white/70">Tip događaja *</label>
          <select
            value={f.type}
            onChange={onChange("type")}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
          >
            {["Svadba", "Venčanje", "Portret", "Rođendan", "Krštenja", "Drugo"].map((t) => (
              <option key={t}>{t}</option>
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
          <label className="text-sm text-white/70">Email *</label>
          <input
            type="email"
            value={f.email}
            onChange={onChange("email")}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
            placeholder="npr. korisnik@email.com"
            required
            aria-invalid={!emailValid}
          />
          {!emailValid && <span className="text-xs text-red-400/90">Unesite validan email.</span>}
        </div>

        <div className="grid gap-1 md:col-span-2">
          <label className="text-sm text-white/70">Pitanje / poruka</label>
          <textarea
            rows={3}
            value={f.message}
            onChange={onChange("message")}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-accent-400/60"
            placeholder="Ukoliko imate pitanje, napišite ga ovde…"
          />
        </div>
      </div>

      <div className="mt-1 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div className="text-xs text-white/60">
          Ispunite kratku formu i javljamo se u najkraćem roku.
        </div>
        <button
          type="submit"
          disabled={!canSubmit || sending}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-70"
          title={canSubmit ? "Pošalji brzi upit" : "Popunite obavezna polja"}
        >
          {sending ? "Slanje…" : sent === "ok" ? "Poslato ✓" : "Pošalji brzi upit"}
        </button>
      </div>

      {sent === "ok" && (
        <div className="text-sm text-emerald-300/90">
          Hvala! Vaša poruka je poslata — proverite email u narednim satima.
        </div>
      )}
      {sent === "err" && (
        <div className="text-sm text-red-400/90">
          Ups, nešto nije u redu. Pokušajte kasnije ili nas kontaktirajte direktno emailom/telefonom.
        </div>
      )}
    </form>
  );
}