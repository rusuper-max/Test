"use client";

import Script from "next/script";

export default function TurnstileLoader() {
  return (
    <Script
      id="cf-turnstile"
      src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      strategy="afterInteractive"
      onLoad={() => {
        // javi formama da je skripta spremna
        document.dispatchEvent(new Event("cf-turnstile-loaded"));
      }}
    />
  );
}