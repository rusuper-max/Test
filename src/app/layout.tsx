// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
// src/app/layout.tsx
import Script from "next/script";

// u <head>:
<Script
  id="cf-turnstile"
  src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
  strategy="afterInteractive"
  async
  defer
/>

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Studio Contrast";

// promeni verziju kad želiš da nateraš browser da povuče novu ikonu
const ICON_VER = "20251024b";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Wedding & portrait photography studio — premium dark-first portfolio i ponude.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: "Wedding & portrait photography studio — premium dark-first portfolio i ponude.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Wedding & portrait photography studio — premium dark-first portfolio i ponude.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },

  // Eksplicitno ka /icon.png uz verziju — Next App Router
  icons: {
    icon: [{ url: `/icon.png?v=${ICON_VER}`, type: "image/png", sizes: "any" }],
    shortcut: [{ url: `/icon.png?v=${ICON_VER}` }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/og.jpg`,
    description:
      "Wedding & portrait photography studio — prirodni trenuci, istinite emocije i upečatljive fotografije.",
    areaServed: "Serbia",
    address: { "@type": "PostalAddress", addressCountry: "RS" },
    sameAs: [],
  };

  return (
    <html lang="sr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* Tvrdi linkovi — pomažu da pregaziš keš u devu */}
        <link rel="icon" href={`/icon.png?v=${ICON_VER}`} sizes="any" type="image/png" />
        <link rel="shortcut icon" href={`/icon.png?v=${ICON_VER}`} />
      </head>
      <body>{children}</body>
    </html>
  );
}