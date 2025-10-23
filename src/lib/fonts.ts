import { Great_Vibes, Cinzel, Cinzel_Decorative } from "next/font/google";

// Script za svečane natpise (npr. "Portfolio")
export const fancy = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fancy",
});

// Klasični serif (ako zatreba u tekstu/headingu)
export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
});

// Ornamental caps za “etikete” (VENČANJE, VERIDBA…)
export const deco = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-deco",
});