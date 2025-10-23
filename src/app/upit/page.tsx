// src/app/upit/page.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { fancy } from "@/lib/fonts";
import InquiryForm from "@/components/InquiryForm";
import type { PlanSlug } from "@/data/packages";

export const metadata = {
  title: "Pošalji upit | Studio Contrast",
  description:
    "Pošaljite detaljan upit: paket, dodaci, datum, lokacija i kontakt. Mi odgovaramo u najkraćem roku.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = {
  // kontakt + događaj
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  location?: string;
  start?: string;
  end?: string;
  type?: string;
  message?: string;

  // iz Konfiguratora
  plan?: string;
  extraHours?: string;
  price?: string;

  // addoni (true/1 samo kad su čekirani)
  secondPhotog?: string;
  thirdPhotog?: string;
  secondVideographer?: string;
  video?: string;
  video4k?: string;
  drone?: string;
  album?: string;
  express?: string;
  raw?: string;
  printOnSite?: string;
  usb?: string;
  dontPublish?: string;
};

function getStr(v: string | string[] | undefined) {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}
function toNum(v: string | undefined, def = 0) {
  const n = Number(getStr(v));
  return Number.isFinite(n) ? n : def;
}
function toBool(v: string | undefined) {
  const s = getStr(v).toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}
function normalizePlan(v: string | undefined): PlanSlug | undefined {
  const s = getStr(v);
  return (["basic", "classic", "signature"] as const).includes(s as any) ? (s as PlanSlug) : undefined;
}

// vizuelna imena
const DISPLAY_PLAN_NAME: Record<PlanSlug, string> = {
  basic: "Standard",
  classic: "Premium",
  signature: "Signature",
};

/** Akcent boje po paketu (isti set kao u konfiguratoru) */
const PLAN_COLORS: Record<PlanSlug, { border: string; badge: string }> = {
  basic:   { border: "rgba(229,231,235,.55)", badge: "rgba(229,231,235,.45)" },
  classic: { border: "rgba(245,208,66,.65)",  badge: "rgba(245,208,66,.55)"  },
  signature:{ border:"rgba(45,212,191,.7)",   badge:"rgba(45,212,191,.55)"   },
};

// lepo ime addona za prikaz u rezimeu
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

export default function InquiryPage({ searchParams = {} }: { searchParams?: SearchParams }) {
  // PREFILL iz query stringa (dolazi iz konfiguratora)
  const prefill = {
    // kontakt + događaj
    name: getStr(searchParams.name),
    email: getStr(searchParams.email),
    phone: getStr(searchParams.phone),
    date: getStr(searchParams.date),
    location: getStr(searchParams.location),
    start: getStr(searchParams.start),
    end: getStr(searchParams.end),
    type: getStr(searchParams.type),
    message: getStr(searchParams.message),

    // iz Konfiguratora
    plan: normalizePlan(searchParams.plan),
    extraHours: toNum(searchParams.extraHours),
    priceHint: toNum(searchParams.price) || undefined,

    // addoni
    secondPhotog: toBool(searchParams.secondPhotog),
    thirdPhotog: toBool(searchParams.thirdPhotog),
    secondVideographer: toBool(searchParams.secondVideographer),
    video: toBool(searchParams.video),
    video4k: toBool(searchParams.video4k),
    drone: toBool(searchParams.drone),
    album: toBool(searchParams.album),
    express: toBool(searchParams.express),
    raw: toBool(searchParams.raw),
    printOnSite: toBool(searchParams.printOnSite),
    usb: toBool(searchParams.usb),
    dontPublish: toBool(searchParams.dontPublish),
  };

  const hasPlan = !!prefill.plan;
  const selectedAddons = Object.entries({
    secondPhotog: prefill.secondPhotog,
    thirdPhotog: prefill.thirdPhotog,
    secondVideographer: prefill.secondVideographer,
    video: prefill.video,
    video4k: prefill.video4k,
    drone: prefill.drone,
    album: prefill.album,
    express: prefill.express,
    raw: prefill.raw,
    printOnSite: prefill.printOnSite,
    usb: prefill.usb,
    dontPublish: prefill.dontPublish,
  })
    .filter(([, v]) => !!v)
    .map(([k]) => k);

  // link nazad na konfigurator — prenesi sve izabrano
  const backQs = new URLSearchParams();
  if (prefill.plan) backQs.set("plan", prefill.plan);
  if (prefill.type) backQs.set("type", prefill.type);
  if (prefill.extraHours) backQs.set("extraHours", String(prefill.extraHours));
  if (prefill.priceHint) backQs.set("price", String(prefill.priceHint));
  for (const key of selectedAddons) backQs.set(key, "1");
  const backToConfiguratorHref = `/ponude${backQs.toString() ? `?${backQs.toString()}` : ""}`;

  // akcent boje iz plana → CSS varijable koje koristimo ispod
  const accentStyle =
    hasPlan && prefill.plan
      ? ({ ["--accent" as any]: PLAN_COLORS[prefill.plan].border,
           ["--accentBadge" as any]: PLAN_COLORS[prefill.plan].badge } as React.CSSProperties)
      : undefined;

  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          <div className="text-center">
            <div className={`${fancy.className} text-accent-grad select-none text-4xl leading-none md:text-5xl`}>
              Pošalji upit
            </div>
            <h1 className="mt-2 font-serif text-3xl font-semibold md:text-5xl">
              Recite nam detalje — mi se javljamo uskoro
            </h1>
            <p className="lead mx-auto mt-3 max-w-2xl text-white/85">
              Ako ste došli iz „Ponuda“, vaša podešavanja su već popunjena. Po potrebi ih izmenite, dodajte datum,
              lokaciju i kontakt, a zatim pošaljite upit.
            </p>
          </div>

          {/* ——— REZIME ODABIRA ——— */}
          <div className="mt-10">
            {!hasPlan ? (
              <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/5 p-4 text-yellow-100">
                <div className="font-medium">Niste odabrali paket</div>
                <p className="mt-1 text-sm text-yellow-200/90">
                  Najpre izaberite paket i opcije u konfiguratoru kako bismo popunili rezime.
                </p>
                <a href="/ponude" className="btn btn-primary mt-3 inline-flex">
                  Idi na konfigurator
                </a>
              </div>
            ) : (
              <div className="accent-card rounded-2xl border border-white/10 bg-white/[0.04] p-4" style={accentStyle}>
                <div className="text-sm text-white/70">Odabrali ste</div>
                <div className="mt-1 text-lg font-medium">
                  {prefill.plan ? DISPLAY_PLAN_NAME[prefill.plan] : ""}{prefill.type ? ` · ${prefill.type}` : ""}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 p-3">
                    <div className="text-xs text-white/60">Orijentaciona cena</div>
                    <div className="mt-1 text-2xl font-semibold">
                      {prefill.priceHint ? `${prefill.priceHint.toLocaleString("sr-RS")} €` : "—"}
                    </div>
                    {!!prefill.extraHours && (
                      <div className="mt-1 text-xs text-white/60">
                        + {prefill.extraHours}h posle ponoći (obračun se vrši po ceni iz konfiguratora)
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 p-3">
                    <div className="text-xs text-white/60">Dodatne opcije</div>
                    {selectedAddons.length === 0 ? (
                      <div className="mt-1 text-white/80 text-sm">Bez dodatnih opcija</div>
                    ) : (
                      <ul className="mt-1 flex flex-wrap gap-2">
                        {selectedAddons.map((k) => (
                          <li
                            key={k}
                            className="addon-chip rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white/85"
                            title={prettyLabel(k)}
                          >
                            {prettyLabel(k)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  <a href={backToConfiguratorHref} className="accent-btn inline-flex items-center rounded-xl px-3 py-2 text-sm">
                    Vrati se na konfigurator
                  </a>
                </div>

                <style>{`
                  .accent-card { transition: box-shadow .25s ease, border-color .25s ease; }
                  .accent-card:hover {
                    border-color: var(--accentBadge);
                    box-shadow:
                      0 0 0 1px var(--accentBadge) inset,
                      0 0 42px rgba(255,255,255,0.04) inset;
                  }

                  .addon-chip {
                    transition: color .2s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease;
                  }
                  .addon-chip:hover {
                    color: var(--accent);
                    border-color: var(--accentBadge);
                    background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
                    box-shadow:
                      0 0 0 1px var(--accentBadge) inset,
                      0 0 16px rgba(255,255,255,.05) inset;
                  }

                  .accent-btn {
                    border: 1px solid var(--accentBadge);
                    color: var(--accent);
                    background: transparent;
                    transition: background .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease;
                  }
                  .accent-btn:hover {
                    border-color: var(--accent);
                    color: var(--accent);
                    background: rgba(255,255,255,0.05);
                    box-shadow: 0 0 0 1px var(--accentBadge) inset;
                  }
                `}</style>
              </div>
            )}
          </div>

          {/* ——— FORMA ——— */}
          <div className="mt-10">
            <InquiryForm prefill={prefill as any} />
          </div>

          <p className="mt-6 text-center text-xs text-white/60">
            Radimo širom Srbije i regiona. U sezoni termini se brzo popunjavaju — javite se na vreme.
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}