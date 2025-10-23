// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Studio Contrast";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Wedding & portrait photography studio — premium dark-first portfolio i ponude.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: "Wedding & portrait photography studio — premium dark-first portfolio i ponude.",
    images: [
      {
        url: "/og.jpg", // napravi ovaj fajl u /public (1200x630)
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Wedding & portrait photography studio — premium dark-first portfolio i ponude.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // JSON-LD (Organization / LocalBusiness)
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/og.jpg`,
    description:
      "Wedding & portrait photography studio — prirodni trenuci, istinite emocije i upečatljive fotografije.",
    areaServed: "Serbia",
    address: {
      "@type": "PostalAddress",
      addressCountry: "RS",
    },
    // (opciono) popuni ako želiš da prikažeš telefon/mail javno u šemi
    // telephone: "+381 6x xxx xxxx",
    // email: "studio.contrast031@gmail.com",
    sameAs: [
      // npr: "https://www.instagram.com/...", "https://www.facebook.com/..."
    ],
  };

  return (
    <html lang="sr">
      <head>
        {/* JSON-LD može i u <head> i u <body>; ovde ga stavljamo u <head> */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}