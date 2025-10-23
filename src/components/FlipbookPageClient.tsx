"use client";

import FlipbookOverlay, { FlipItem } from "./FlipbookOverlay";
import { useRouter } from "next/navigation";

export default function FlipbookPageClient({
  items,
  backHref,
  fullHref,
}: {
  items: FlipItem[];
  backHref: string;
  fullHref?: string;
}) {
  const router = useRouter();
  return (
    <FlipbookOverlay
      items={items}
      onClose={() => router.push(backHref)}
      fullHref={fullHref}
    />
  );
}