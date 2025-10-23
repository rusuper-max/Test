"use client";

import FlipbookOverlay from "@/components/FlipbookOverlay";
import { useRouter } from "next/navigation";

const ITEMS = [
  { src: "/photos/p1.webp", alt: "Strana 1" },
  { src: "/photos/p2.webp", alt: "Strana 2" },
  { src: "/photos/p3.webp", alt: "Strana 3" },
  { src: "/photos/p4.webp", alt: "Strana 4" },
  { src: "/photos/p5.webp", alt: "Strana 5" },
  { src: "/photos/p6.webp", alt: "Strana 6" },
];

export default function AlbumClient() {
  const router = useRouter();
  return (
    <FlipbookOverlay
      items={ITEMS}
      onClose={() => router.push("/portfolio")}
    />
  );
}