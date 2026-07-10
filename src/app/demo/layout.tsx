import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo | NewPerks — Cartão Fidelidade Digital",
  description:
    "Teste o cartão fidelidade digital NewPerks ao vivo. Veja como funciona antes de criar o seu.",
  openGraph: {
    title: "Demo | NewPerks",
    description: "Teste o cartão fidelidade digital ao vivo.",
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
