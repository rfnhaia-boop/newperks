import LandingPageContent from "@/components/LandingPageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NewPerks | Cartão Fidelidade Digital 3D",
  description: "Fidelize clientes sem aplicativos e sem papel. Crie seu cartão fidelidade digital em minutos com experiência premium.",
};

export default function Home() {
  return <LandingPageContent />;
}
