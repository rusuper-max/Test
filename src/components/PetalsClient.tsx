"use client";
import dynamic from "next/dynamic";

// čisto klijentsko učitavanje
const Petals = dynamic(() => import("./Petals"), { ssr: false });

export default function PetalsClient() {
  return <Petals />;
}